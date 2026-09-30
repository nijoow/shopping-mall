import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultConfig, modelAsset, modelPoster } from '../src/domain/catalog';
import { configSchema, configKey } from '../src/domain/validation';

test('new low designs use v2 while saved v1 designs keep their original asset', () => {
  const current = defaultConfig('low');
  const legacy = { ...current, modelVersion: 1 as const };
  assert.equal(current.modelVersion, 2);
  assert.equal(modelAsset(configSchema.parse(current)), '/models/low-v2.glb');
  assert.equal(modelAsset(configSchema.parse(legacy)), '/models/low-v1.glb');
  assert.equal(modelPoster(current), '/editorial/low-v2.png?v=20260930');
  assert.equal(modelPoster(legacy), '/editorial/low.png?v=20260910');
  assert.notEqual(configKey(current), configKey(legacy));
});

test('only available model versions are accepted', () => {
  assert.equal(defaultConfig('runner').modelVersion, 1);
  assert.equal(
    configSchema.safeParse({ ...defaultConfig('runner'), modelVersion: 2 })
      .success,
    false,
  );
  assert.equal(
    configSchema.safeParse({ ...defaultConfig('low'), modelVersion: 3 })
      .success,
    false,
  );
});
