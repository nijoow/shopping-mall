import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DemoRepository } from '../src/server/repository';
import {
  defaultConfig,
  FREE_SHIPPING,
  SHIPPING_FEE,
} from '../src/domain/catalog';
import { orderTotals } from '../src/domain/orders';

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
    { code: 'OUT_OF_STOCK', status: 400 },
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
    { code: 'QUOTE_CHANGED', status: 409 },
  );
  await assert.rejects(
    async () => await repo.checkout(w.id, { ...data, scenario: 'declined' }),
    { code: 'DEMO_DECLINED', status: 400 },
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
    { code: 'NOT_FOUND', status: 404 },
  );
  await assert.rejects(
    async () => await repo.advanceOrder(w.id, order.id, 'DELIVERED'),
    { code: 'INVALID_TRANSITION', status: 409 },
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
    { code: 'CONFLICT', status: 409 },
  );
  await repo.close();
});
test('a browser token revisits only its own designs, favorites, cart and orders', async () => {
  const { repo, workspace: w } = await setup();
  try {
    const d = await repo.saveDesign(w.id, {
      id: randomUUID(),
      name: 'Owned',
      version: 0,
      config: defaultConfig('low'),
    });
    await repo.favorite(w.id, 'runner');
    const purchased = await add(repo, w.id);
    const order = await repo.checkout(
      w.id,
      await input(repo, w.id, [purchased]),
    );
    const remaining = await add(repo, w.id, 1, '#ffffff');
    const before = await repo.state(w.id);
    const revisit = await repo.workspace(w.token);
    assert.deepEqual(revisit, w);
    assert.deepEqual(await repo.state(revisit.id), before);
    assert.equal(before.designs[0].id, d.id);
    assert.equal(before.orders[0].id, order.id);
    assert.equal(before.cart[0].id, remaining);
    assert.deepEqual(before.favorites, ['runner']);
    assert.equal(Object.hasOwn(before, 'signedIn'), false);
    assert.equal(Object.hasOwn(before, 'name'), false);
    for (const invalid of [
      undefined,
      w.id,
      'a'.repeat(64),
      'invalid-token',
      w.token.slice(0, -1),
    ]) {
      const stranger = await repo.workspace(invalid);
      assert.notEqual(stranger.id, w.id);
      assert.equal((await repo.state(stranger.id)).designs.length, 0);
      await assert.rejects(
        repo.saveDesign(stranger.id, {
          id: d.id,
          name: 'Foreign',
          version: d.version,
          config: d.config,
        }),
        { code: 'NOT_FOUND', status: 404 },
      );
      await assert.rejects(
        repo.advanceOrder(stranger.id, order.id, 'CANCELLED'),
        { code: 'NOT_FOUND', status: 404 },
      );
    }
  } finally {
    await repo.close();
  }
});

test('a live historical member cookie detaches only its own workspace without merging data', async () => {
  const { repo, workspace: w } = await setup();
  try {
    const accountId = randomUUID();
    await repo.run(
      'INSERT INTO accounts VALUES(?,?,?,?)',
      accountId,
      'historical',
      randomUUID(),
      'Previous member',
    );
    const unclaimed = await repo.workspace();
    const design = await repo.saveDesign(w.id, {
      id: randomUUID(),
      name: 'History',
      version: 0,
      config: defaultConfig('low'),
    });
    const shared = await repo.share(w.id, design.id);
    await repo.favorite(w.id, 'low');
    const line = await add(repo, w.id);
    const order = await repo.checkout(w.id, await input(repo, w.id, [line]));
    const cartLine = await add(repo, w.id, 1, '#ffffff');
    for (const space of [w, unclaimed])
      await repo.run(
        'UPDATE workspaces SET account_id=? WHERE id=?',
        accountId,
        space.id,
      );
    const before = await repo.state(w.id);
    const claimed = await repo.workspace(w.token);
    assert.deepEqual(claimed, w);
    assert.deepEqual(await repo.state(claimed.id), before);
    assert.equal(
      (await repo.row('SELECT account_id FROM workspaces WHERE id=?', w.id))!
        .account_id,
      null,
    );
    assert.equal(
      (await repo.row(
        'SELECT account_id FROM workspaces WHERE id=?',
        unclaimed.id,
      ))!.account_id,
      accountId,
    );
    assert.ok(await repo.row('SELECT id FROM accounts WHERE id=?', accountId));
    assert.equal(before.orders[0].id, order.id);
    assert.equal(before.cart[0].id, cartLine);
    assert.deepEqual((await repo.shared(shared))!.config, design.config);
    assert.deepEqual(await repo.workspace(w.token), claimed);
    const stranger = await repo.workspace(unclaimed.id);
    assert.notEqual(stranger.id, unclaimed.id);
    assert.equal(
      (await repo.row(
        'SELECT account_id FROM workspaces WHERE id=?',
        unclaimed.id,
      ))!.account_id,
      accountId,
    );
  } finally {
    await repo.close();
  }
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
    { code: 'NOT_FOUND', status: 404 },
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

test('quotes keep the free-shipping boundary and quantity-weighted totals', () => {
  for (const [subtotal, shipping] of [
    [149999, 3000],
    [150000, 0],
    [150001, 0],
  ]) {
    assert.deepEqual(orderTotals([{ unitPrice: subtotal, quantity: 1 }]), {
      subtotal,
      shipping,
      total: subtotal + shipping,
    });
  }
  assert.deepEqual(
    orderTotals([
      { unitPrice: 39000, quantity: 2 },
      { unitPrice: 69000, quantity: 1 },
    ]),
    { subtotal: 147000, shipping: 3000, total: 150000 },
  );
});

test('delivery and return preserve the order snapshot and refund inventory only once', async () => {
  const { repo, workspace: w } = await setup();
  try {
    const line = await add(repo, w.id, 2);
    const original = await repo.checkout(w.id, await input(repo, w.id, [line]));
    await repo.advanceOrder(w.id, original.id, 'PREPARING');
    await repo.advanceOrder(w.id, original.id, 'SHIPPED');
    await assert.rejects(repo.advanceOrder(w.id, original.id, 'CANCELLED'), {
      code: 'INVALID_TRANSITION',
    });
    await assert.rejects(repo.advanceOrder(w.id, original.id, 'REFUNDED'), {
      code: 'INVALID_TRANSITION',
    });
    await repo.advanceOrder(w.id, original.id, 'DELIVERED');
    await repo.advanceOrder(w.id, original.id, 'RETURN_REQUESTED');
    assert.equal(await repo.stock(w.id, 'runner', '270'), 18);
    const refunded = await repo.advanceOrder(w.id, original.id, 'REFUNDED');
    const repeated = await repo.advanceOrder(w.id, original.id, 'REFUNDED');
    assert.deepEqual(repeated, refunded);
    assert.deepEqual(refunded.items, original.items);
    assert.equal(refunded.total, original.total);
    assert.equal(await repo.stock(w.id, 'runner', '270'), 20);
    assert.deepEqual(
      refunded.events.map(event => event.status),
      [
        'CONFIRMED',
        'PREPARING',
        'SHIPPED',
        'DELIVERED',
        'RETURN_REQUESTED',
        'REFUNDED',
      ],
    );
    await assert.rejects(repo.advanceOrder(w.id, original.id, 'PREPARING'), {
      code: 'INVALID_TRANSITION',
    });
  } finally {
    await repo.close();
  }
});
