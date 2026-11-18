import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PostgresStore } from '../src/server/database';
import { DemoRepository } from '../src/server/repository';
import { defaultConfig, SHIPPING_FEE } from '../src/domain/catalog';
import { DomainError } from '../src/domain/validation';
const url = process.env.NIJOOW_TEST_POSTGRES_URL?.trim();
test(
  'PostgreSQL persists across connections and serializes orders, revisions and refunds',
  { skip: !url },
  async () => {
    const stores = [new PostgresStore(url!), new PostgresStore(url!)];
    const repos = stores.map(s => new DemoRepository(s));
    const owned: string[] = [];
    try {
      const workspace = await repos[0].workspace();
      owned.push(workspace.id);
      const stranger = await repos[1].workspace();
      owned.push(stranger.id);
      const config = defaultConfig('low');
      const line = await repos[0].addCart(workspace.id, {
        productId: 'low',
        size: '270',
        quantity: 2,
        config,
      });
      assert.equal(
        (await repos[1].state(workspace.id)).cart[0].config!.modelVersion,
        3,
      );
      const state = await repos[0].state(workspace.id);
      const subtotal = state.cart.reduce(
        (n, l) => n + l.quantity * l.unitPrice,
        0,
      );
      const data = {
        requestKey: randomUUID(),
        lineIds: [line],
        addressId: 'studio',
        scenario: 'success',
        quotedTotal: subtotal + (subtotal >= 150000 ? 0 : SHIPPING_FEE),
      };
      const orders = await Promise.all(
        repos.map(r => r.checkout(workspace.id, data)),
      );
      assert.equal(orders[0].id, orders[1].id);
      assert.equal((await repos[0].state(workspace.id)).orders.length, 1);
      assert.equal(await repos[1].stock(workspace.id, 'low', '270'), 18);
      await assert.rejects(
        repos[1].advanceOrder(stranger.id, orders[0].id, 'CANCELLED'),
        (error: unknown) =>
          error instanceof DomainError &&
          error.code === 'NOT_FOUND' &&
          error.status === 404,
      );
      await Promise.all(
        repos.map(r => r.advanceOrder(workspace.id, orders[0].id, 'CANCELLED')),
      );
      assert.equal(await repos[0].stock(workspace.id, 'low', '270'), 20);
      const design = await repos[0].saveDesign(workspace.id, {
        id: randomUUID(),
        name: 'PG regression',
        version: 0,
        config,
      });
      const revisions = await Promise.allSettled(
        repos.map(r =>
          r.saveDesign(workspace.id, {
            id: design.id,
            config: design.config,
            version: design.version,
            name: 'Revision',
          }),
        ),
      );
      assert.equal(revisions.filter(r => r.status === 'fulfilled').length, 1);
      const failed = revisions.find(
        r => r.status === 'rejected',
      ) as PromiseRejectedResult;
      assert.equal(failed.reason.code, 'CONFLICT');
      const limited = await repos[0].workspace();
      owned.push(limited.id);
      for (let i = 0; i < 29; i++)
        await repos[0].saveDesign(limited.id, {
          id: randomUUID(),
          name: `Rate ${i}`,
          version: 0,
          config,
        });
      const rates = await Promise.allSettled(
        repos.map(r =>
          r.saveDesign(limited.id, {
            id: randomUUID(),
            name: 'Boundary',
            version: 0,
            config,
          }),
        ),
      );
      assert.equal(rates.filter(r => r.status === 'fulfilled').length, 1);
      const rateFailure = rates.find(
        r => r.status === 'rejected',
      ) as PromiseRejectedResult;
      assert.equal(rateFailure.reason.code, 'RATE_LIMITED');
      assert.equal(rateFailure.reason.status, 429);
      assert.equal((await repos[1].state(limited.id)).designs.length, 30);
      const share = await repos[0].share(workspace.id, design.id);
      assert.equal((await repos[1].shared(share))!.config.modelVersion, 3);
    } finally {
      try {
        for (const id of owned) {
          for (const table of [
            'shares',
            'orders',
            'inventory',
            'designs',
            'favorites',
            'cart',
          ])
            await repos[0].run(`DELETE FROM ${table} WHERE workspace_id=?`, id);
          await repos[0].run(
            'DELETE FROM operation_limits WHERE key IN (?,?)',
            `save:${id}`,
            `share:${id}`,
          );
          await repos[0].run('DELETE FROM workspaces WHERE id=?', id);
        }
      } finally {
        await Promise.all(stores.map(s => s.close()));
      }
    }
  },
);
