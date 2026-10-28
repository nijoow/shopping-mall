import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, modelAsset, modelPoster } from '../src/domain/catalog';
import {
  configSchema,
  configKey,
  designDraftSchema,
} from '../src/domain/validation';

test('new low designs use v3 while saved v1/v2 designs keep their original assets', () => {
  const current = defaultConfig('low');
  const legacy = { ...current, modelVersion: 1 as const };
  assert.equal(current.modelVersion, 3);
  assert.equal(modelAsset(configSchema.parse(current)), '/models/low-v3.glb');
  assert.equal(modelAsset(configSchema.parse(legacy)), '/models/low-v1.glb');
  assert.equal(modelPoster(current), '/editorial/low-v3.png');
  assert.equal(modelPoster(legacy), '/editorial/low.png?v=20260910');
  assert.notEqual(configKey(current), configKey(legacy));
  assert.equal(
    modelAsset({ ...current, modelVersion: 2 }),
    '/models/low-v2.glb',
  );
  assert.equal(
    modelPoster({ ...current, modelVersion: 2 }),
    '/editorial/low-v2.png?v=20260930',
  );
  assert.equal(
    modelAsset({ ...defaultConfig('runner'), modelVersion: 1 }),
    '/models/runner-v1.glb',
  );
});

test('only available model versions are accepted', () => {
  assert.equal(defaultConfig('runner').modelVersion, 2);
  assert.equal(
    configSchema.safeParse({ ...defaultConfig('runner'), modelVersion: 3 })
      .success,
    false,
  );
  assert.equal(
    configSchema.safeParse({ ...defaultConfig('low'), modelVersion: 4 })
      .success,
    false,
  );
});

test('stored drafts preserve unfinished names and legacy models but reject invalid identity and revisions', () => {
  const draft = {
    id: 'local-draft',
    name: '  ',
    config: { ...defaultConfig('low'), modelVersion: 1 as const },
  };
  assert.deepEqual(designDraftSchema.parse(draft), { ...draft, version: 0 });
  assert.deepEqual(designDraftSchema.parse({ ...draft, version: 7 }), {
    ...draft,
    version: 7,
  });
  for (const change of [
    { id: undefined },
    { id: '../invalid' },
    { name: {} },
    { name: 'x'.repeat(41) },
    { version: -1 },
    { version: '1' },
    { config: { ...draft.config, modelVersion: 99 } },
  ]) {
    assert.equal(
      designDraftSchema.safeParse({ ...draft, ...change }).success,
      false,
    );
  }
});
