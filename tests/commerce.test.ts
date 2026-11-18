import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DemoRepository } from '../src/server/repository';
import {
  defaultConfig,
  FREE_SHIPPING,
  SHIPPING_FEE,
} from '../src/domain/catalog';

async function setup() {
  const repo = new DemoRepository(':memory:');
  const workspace = await repo.workspace();
  return { repo, workspace };
}
async function add(
  repo: DemoRepository,
  workspace: string,
  quantity = 1,
  color = '#a6a9ac',
) {
  const config = defaultConfig('runner');
  config.colors.upper = color;
  return await repo.addCart(workspace, {
    productId: 'runner',
    size: '270',
    quantity,
    config,
  });
}
async function input(
  repo: DemoRepository,
  workspace: string,
  lineIds: string[],
  requestKey = randomUUID(),
  scenario = 'success',
) {
  const subtotal = (await repo.state(workspace)).cart
    .filter(l => lineIds.includes(l.id))
    .reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  return {
    lineIds,
    requestKey,
    addressId: 'studio',
    scenario,
    quotedTotal: subtotal + (subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE),
  };
}
test('unknown sizes, incompatible models, invalid colors and large quantities are rejected', async () => {
  const { repo, workspace: w } = await setup();
  await assert.rejects(
    async () =>
      await repo.addCart(w.id, {
        productId: 'runner',
        size: 'INVALID',
        quantity: 1,
      }),
  );
  await assert.rejects(
    async () =>
      await repo.addCart(w.id, {
        productId: 'runner',
        size: '270',
        quantity: 1,
        config: defaultConfig('low'),
      }),
  );
  await assert.rejects(async () => await add(repo, w.id, 99));
  assert.equal((await repo.state(w.id)).cart.length, 0);
  await repo.close();
});
test('same size across different designs is aggregated and a failed order rolls back', async () => {
  const { repo, workspace: w } = await setup();
  const a = await add(repo, w.id, 3),
    b = await add(repo, w.id, 3, '#ffffff');
  await repo.run(
    'INSERT INTO inventory VALUES(?,?,?,?)',
    w.id,
    'runner',
    '270',
    5,
  );
  await assert.rejects(
    async () => await repo.checkout(w.id, await input(repo, w.id, [a, b])),
    /재고/,
  );
  assert.equal(await repo.stock(w.id, 'runner', '270'), 5);
  assert.equal((await repo.state(w.id)).orders.length, 0);
  assert.equal((await repo.state(w.id)).cart.length, 2);
  await repo.close();
});
test('retransmitting a successful request returns one order without another stock decrement', async () => {
  const { repo, workspace: w } = await setup();
  const id = await add(repo, w.id, 2);
  const data = await input(repo, w.id, [id]);
  const first = await repo.checkout(w.id, data),
    second = await repo.checkout(w.id, data);
  assert.equal(first.id, second.id);
  assert.equal(await repo.stock(w.id, 'runner', '270'), 18);
  assert.equal((await repo.state(w.id)).orders.length, 1);
  await repo.close();
});
test('server quote prevents tampered totals; simulated failure preserves cart and inventory', async () => {
  const { repo, workspace: w } = await setup();
  const id = await add(repo, w.id);
  const data = await input(repo, w.id, [id]);
  await assert.rejects(
    async () => await repo.checkout(w.id, { ...data, quotedTotal: 1 }),
    /금액/,
  );
  await assert.rejects(
    async () => await repo.checkout(w.id, { ...data, scenario: 'declined' }),
    /모의/,
  );
  assert.equal((await repo.state(w.id)).cart.length, 1);
  assert.equal(await repo.stock(w.id, 'runner', '270'), 20);
  await repo.close();
});
test('an order only clears purchased rows and keeps the exact design snapshot', async () => {
  const { repo, workspace: w } = await setup();
  const a = await add(repo, w.id),
    b = await add(repo, w.id, 1, '#ffffff');
  const order = await repo.checkout(w.id, await input(repo, w.id, [a]));
  await repo.changeQuantity(w.id, b, 2);
  assert.equal((await repo.state(w.id)).cart[0].id, b);
  assert.equal(order.items[0].config!.colors.upper, '#a6a9ac');
  assert.equal(order.items[0].quantity, 1);
  await repo.close();
});
test('order ownership and state transitions are enforced and refunds restore inventory once', async () => {
  const { repo, workspace: w } = await setup();
  const stranger = await repo.workspace();
  const id = await add(repo, w.id, 2);
  const order = await repo.checkout(w.id, await input(repo, w.id, [id]));
  await assert.rejects(
    async () => await repo.advanceOrder(stranger.id, order.id, 'CANCELLED'),
    /찾을/,
  );
  await assert.rejects(
    async () => await repo.advanceOrder(w.id, order.id, 'DELIVERED'),
    /현재/,
  );
  await repo.advanceOrder(w.id, order.id, 'CANCELLED');
  await repo.advanceOrder(w.id, order.id, 'CANCELLED');
  assert.equal(await repo.stock(w.id, 'runner', '270'), 20);
  await assert.rejects(
    async () => await repo.advanceOrder(w.id, order.id, 'PREPARING'),
  );
  await repo.close();
});
test('shares freeze a design revision and optimistic revision checks prevent overwrites', async () => {
  const { repo, workspace: w } = await setup();
  const d = await repo.saveDesign(w.id, {
    id: randomUUID(),
    name: 'Original',
    version: 0,
    config: defaultConfig('runner'),
  });
  const token = await repo.share(w.id, d.id);
  const next = { ...d.config, engraving: 'NIJOOW' };
  await repo.saveDesign(w.id, {
    id: d.id,
    name: 'Changed',
    version: 1,
    config: next,
  });
  assert.equal((await repo.shared(token))!.config.engraving, '');
  await assert.rejects(
    async () =>
      await repo.saveDesign(w.id, {
        id: d.id,
        name: 'Stale',
        version: 1,
        config: next,
      }),
    /다른 창/,
  );
  await repo.close();
});
test('guest records merge into a member once without replacing existing designs or orders', async () => {
  const { repo, workspace: guest } = await setup();
  const account = await repo.account('google', 'provider-123', 'Member');
  const member = await repo.workspace(undefined, account);
  const d = await repo.saveDesign(member.id, {
    id: randomUUID(),
    name: 'Existing',
    version: 0,
    config: defaultConfig('low'),
  });
  const cartId = await add(repo, guest.id);
  const order = await repo.checkout(
    guest.id,
    await input(repo, guest.id, [cartId]),
  );
  await repo.favorite(guest.id, 'runner');
  const merged = await repo.workspace(guest.token, account);
  const state = await repo.state(merged.id);
  assert.equal(merged.id, member.id);
  assert.equal(state.designs[0].id, d.id);
  assert.equal(state.orders[0].id, order.id);
  assert.deepEqual(state.favorites, ['runner']);
  const again = await repo.workspace(merged.token, account);
  assert.equal((await repo.state(again.id)).orders.length, 1);
  const loggedOut = await repo.workspace(again.token);
  assert.notEqual(loggedOut.id, member.id);
  assert.equal((await repo.state(loggedOut.id)).orders.length, 0);
  await repo.close();
});
test('provider identity is unique and never joins separate providers by display name', async () => {
  const { repo } = await setup();
  const a = await repo.account('google', '123', 'Same');
  const b = await repo.account('kakao', '123', 'Same');
  assert.notEqual(a, b);
  assert.equal(await repo.account('google', '123', 'Renamed'), a);
  await repo.close();
});

test('cart design replacement preserves quantity and updates only its owned line', async () => {
  const { repo, workspace: w } = await setup();
  const line = await add(repo, w.id, 2),
    other = await add(repo, w.id, 1, '#ffffff');
  const config = defaultConfig('runner');
  config.engraving = 'NEW';
  const result = await repo.replaceCart(w.id, line, { size: '280', config });
  assert.equal(result, line);
  const cart = (await repo.state(w.id)).cart;
  assert.equal(cart.find(l => l.id === line)!.quantity, 2);
  assert.equal(cart.find(l => l.id === line)!.size, '280');
  assert.equal(cart.find(l => l.id === other)!.config!.engraving, '');
  const stranger = await repo.workspace();
  await assert.rejects(
    async () =>
      await repo.replaceCart(stranger.id, line, { size: '270', config }),
    /찾을/,
  );
  await repo.close();
});

test('resetting demo orders keeps saved designs and favorites', async () => {
  const { repo, workspace: w } = await setup();
  const d = await repo.saveDesign(w.id, {
    id: randomUUID(),
    name: 'Keep me',
    version: 0,
    config: defaultConfig('low'),
  });
  await repo.favorite(w.id, 'runner');
  const line = await add(repo, w.id);
  await repo.checkout(w.id, await input(repo, w.id, [line]));
  await repo.resetOrders(w.id);
  const state = await repo.state(w.id);
  assert.equal(state.orders.length, 0);
  assert.equal(state.cart.length, 0);
  assert.equal(state.designs[0].id, d.id);
  assert.deepEqual(state.favorites, ['runner']);
  assert.equal(await repo.stock(w.id, 'runner', '270'), 20);
  await repo.close();
});
