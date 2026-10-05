import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const base = process.env.NIJOOW_TEST_BASE_URL ?? 'http://127.0.0.1:3100';
if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname))
  throw new Error('HTTP smoke tests only run against a local server.');
function client() {
  let cookie = '';
  return async (op, data, options = {}) => {
    const r = await fetch(base + '/api/demo', {
      method: op ? 'POST' : 'GET',
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(op ? { 'Content-Type': 'application/json', Origin: base } : {}),
        ...options.headers,
      },
      ...(op ? { body: JSON.stringify({ op, data }) } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });
    const next = r.headers
      .getSetCookie()
      .find(s => s.startsWith('nijoow-demo-v2='));
    if (next) cookie = next.split(';')[0];
    return { status: r.status, ...(await r.json()) };
  };
}
const c = client(),
  stranger = client();
const initial = await c();
assert.equal(initial.status, 200);
assert.equal(Object.hasOwn(initial.state, 'signedIn'), false);
assert.equal(Object.hasOwn(initial.state, 'name'), false);
assert.equal((await c()).state.workspaceId, initial.state.workspaceId);
// Obsolete authentication cookies cannot select an account or prevent visitor access.
const retiredSession = await fetch(base + '/api/demo', {
  headers: {
    Cookie:
      'authjs.session-token=retired; __Secure-authjs.session-token=retired',
  },
});
assert.equal(retiredSession.status, 200);
assert.notEqual(
  (await retiredSession.json()).state.workspaceId,
  initial.state.workspaceId,
);
for (const path of ['/auth/login', '/auth/sign-up']) {
  const legacy = await fetch(
    base +
      path +
      '?error=Configuration&code=retired&callbackUrl=https://untrusted.example',
    { redirect: 'manual' },
  );
  assert.equal(legacy.status, 307);
  const destination = new URL(legacy.headers.get('location'), base);
  assert.equal(destination.origin, new URL(base).origin);
  assert.equal(destination.pathname, '/my-page');
  assert.equal(destination.search, '');
}
for (const path of [
  '/api/auth/providers',
  '/api/auth/callback/naver?code=retired',
]) {
  const retired = await fetch(base + path, { redirect: 'manual' });
  assert.equal(retired.status, 404);
  assert.equal(retired.headers.get('location'), null);
}

await stranger();
const invalid = await c('cart.add', {
  productId: 'runner',
  size: 'BAD',
  quantity: 1,
});
assert.equal(invalid.status, 400);
assert.equal(invalid.code, 'INVALID_SIZE');
const denied = await c('favorite', 'runner', {
  headers: { Origin: 'https://untrusted.example' },
});
assert.equal(denied.status, 403);
const config = {
  model: 'runner',
  modelVersion: 1,
  colors: {
    upper: '#842e32',
    panel: '#343639',
    sole: '#e6e1d7',
    laces: '#e6e1d7',
  },
  material: 'suede',
  engraving: 'SMOKE',
};
const saved = await c('design.save', {
  id: randomUUID(),
  name: 'API verified design',
  config,
  version: 0,
});
assert.equal(saved.status, 200);
await c('favorite', 'runner');
const cart = await c('cart.add', {
  productId: 'runner',
  size: '270',
  quantity: 2,
  config,
});
assert.equal(cart.status, 200);
const line = cart.state.cart.find(l => l.id === cart.result.lineId);
const requestKey = randomUUID();
const payload = {
  lineIds: [line.id],
  requestKey,
  addressId: 'studio',
  quotedTotal: line.unitPrice * 2,
  scenario: 'declined',
};
const declined = await c('checkout', payload);
assert.equal(declined.status, 400);
assert.equal(declined.code, 'DEMO_DECLINED');
assert.equal((await c()).state.cart.length, 1);
const controller = new AbortController();
const delayed = c(
  'checkout',
  { ...payload, scenario: 'delayed' },
  { signal: controller.signal },
);
setTimeout(() => controller.abort(), 600);
await delayed.catch(e => assert.equal(e.name, 'AbortError'));
const recovered = await c();
const order = recovered.state.orders.find(o => o.requestKey === requestKey);
assert.ok(order);
assert.equal(order.items[0].config.engraving, 'SMOKE');
const replay = await c('checkout', { ...payload, scenario: 'success' });
assert.equal(replay.result.id, order.id);
assert.equal(replay.state.orders.length, 1);
assert.equal(
  (await stranger('order.advance', { id: order.id, status: 'PREPARING' }))
    .status,
  404,
);
for (const status of [
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'RETURN_REQUESTED',
  'REFUNDED',
])
  assert.equal(
    (await c('order.advance', { id: order.id, status })).status,
    200,
  );
const replayRefund = await c('order.advance', {
  id: order.id,
  status: 'REFUNDED',
});
assert.equal(replayRefund.result.events.length, 6);
const second = await c('cart.add', {
  productId: 'runner',
  size: '270',
  quantity: 1,
  config,
});
assert.equal(second.state.cart[0].stock, 20);
const reset = await c('orders.reset', 'CONFIRM_RESET');
assert.equal(reset.state.orders.length, 0);
assert.equal(reset.state.cart.length, 0);
assert.equal(reset.state.designs.length, 1);
assert.deepEqual(reset.state.favorites, ['runner']);
console.log(
  JSON.stringify({
    pass: true,
    checks: [
      'visitor persistence and isolation',
      'retired authentication cookies ignored',
      'legacy UI redirect clears OAuth query',
      'OAuth endpoints unavailable',
      'HTTP validation 400',
      'cross-origin 403',
      'design persistence',
      'declined recovery',
      'response loss recovery',
      'idempotent order',
      'foreign order 404',
      'delivery and refund',
      'single stock restoration',
      'safe reset',
    ],
  }),
);

const parallel = client();
await parallel();
const groups = [[], []];
for (let i = 0; i < 8; i++) {
  const result = await parallel('cart.add', {
    productId: 'runner',
    size: '280',
    quantity: 5,
    config: {
      ...config,
      engraving: '',
      colors: { ...config.colors, upper: '#' + (0x315600 + i).toString(16) },
    },
  });
  groups[Math.floor(i / 4)].push(result.result.lineId);
}
const race = await Promise.all(
  groups.map(lineIds =>
    parallel('checkout', {
      lineIds,
      requestKey: randomUUID(),
      addressId: 'studio',
      quotedTotal: 234000 * 20,
      scenario: 'success',
    }),
  ),
);
assert.deepEqual(race.map(r => r.status).sort(), [200, 400]);
const raceState = (await parallel()).state;
assert.equal(raceState.orders.length, 1);
assert.ok(raceState.cart.every(l => l.stock === 0));
console.log(
  JSON.stringify({
    parallelCheckout: true,
    successfulOrders: raceState.orders.length,
    stock: raceState.cart[0].stock,
  }),
);
