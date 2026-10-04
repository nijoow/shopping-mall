import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configuredSocialProviders, safeReturnPath } from '../auth.providers';
test('only fully configured social providers are offered', () => {
  assert.deepEqual(configuredSocialProviders({}), []);
  assert.deepEqual(
    configuredSocialProviders({
      AUTH_GOOGLE_ID: 'id',
      AUTH_GOOGLE_SECRET: ' secret ',
      AUTH_NAVER_ID: 'id',
      AUTH_NAVER_SECRET: '  ',
      AUTH_KAKAO_ID: 'id',
    }),
    ['google'],
  );
});
test('login return paths preserve drafts and reject external URL forms', () => {
  assert.equal(
    safeReturnPath('/studio/low?design=example#options'),
    '/studio/low?design=example#options',
  );
  for (const bad of [
    'https://evil.invalid',
    '//evil.invalid',
    '/\\evil.invalid',
    '/%5cevil.invalid',
    '/%2f%2fevil.invalid',
    '/bad\npath',
    '/%invalid',
    '/%0aevil',
    '/auth/login?error=Configuration',
    '/auth%2flogin',
    '/api/auth/signin',
    [],
    undefined,
    null,
  ])
    assert.equal(safeReturnPath(bad), '/my-page');
});
