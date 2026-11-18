import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CommerceError,
  commerceError,
  demoRequest,
  errorMessage,
} from '../src/components/commerce/client-api';

test('commerce client preserves API code, HTTP status and Retry-After', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { error: '잠시 후 다시 시도해 주세요.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': '12' } },
    ),
  );
  await assert.rejects(demoRequest(), error => {
    assert.ok(error instanceof CommerceError);
    assert.equal(error.code, 'RATE_LIMITED');
    assert.equal(error.status, 429);
    assert.equal(error.retryAfter, 12);
    assert.match(errorMessage(error), /12초/);
    return true;
  });
});

test('commerce client preserves conflict code independently of the message', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { error: 'Changed elsewhere', code: 'CONFLICT' },
      { status: 409 },
    ),
  );
  await assert.rejects(
    demoRequest(),
    error =>
      error instanceof CommerceError &&
      error.code === 'CONFLICT' &&
      error.status === 409,
  );
});

test('network, non-JSON and malformed successful responses produce safe errors', async t => {
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async (): Promise<Response> => {
      throw new Error('sensitive transport detail');
    },
  );
  await assert.rejects(
    demoRequest(),
    error =>
      error instanceof CommerceError &&
      error.code === 'NETWORK_ERROR' &&
      !error.message.includes('sensitive'),
  );
  fetch.mock.mockImplementation(
    async () => new Response('<html>proxy failure</html>', { status: 502 }),
  );
  await assert.rejects(
    demoRequest(),
    error =>
      error instanceof CommerceError &&
      error.code === 'INVALID_RESPONSE' &&
      error.status === 502,
  );
  fetch.mock.mockImplementation(async () => Response.json({ state: {} }));
  await assert.rejects(
    demoRequest(),
    error =>
      error instanceof CommerceError && error.code === 'INVALID_RESPONSE',
  );
  assert.equal(commerceError(new Error('internal')).code, 'UNAVAILABLE');
  assert.ok(!errorMessage(new Error('internal')).includes('internal'));
});

test('non-JSON rate limits retain header wait guidance', async t => {
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response('limited', { status: 429, headers: { 'Retry-After': '4' } }),
  );
  await assert.rejects(
    demoRequest(),
    error =>
      error instanceof CommerceError &&
      error.code === 'RATE_LIMITED' &&
      error.retryAfter === 4,
  );
});
