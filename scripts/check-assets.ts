import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import {
  PRODUCTS,
  MODEL_FILES,
  defaultConfig,
  type ModelId,
  modelAsset,
  modelPoster,
  type DesignConfig,
} from '../src/domain/catalog';
const root = resolve('public');
function asset(url: string) {
  assert.ok(url.startsWith('/'), `로컬 에셋 경로가 필요해: ${url}`);
  const file = resolve(root, '.' + url.split('?')[0]);
  assert.ok(file.startsWith(root + sep), `public 밖의 경로: ${url}`);
  assert.ok(statSync(file).size > 0, `빈 파일: ${url}`);
  return file;
}
const images = new Set(PRODUCTS.flatMap(p => [p.image, p.detail]));
const models: DesignConfig[] = (Object.keys(MODEL_FILES) as ModelId[]).flatMap(
  model =>
    Object.keys(MODEL_FILES[model]).map(version => ({
      ...defaultConfig(model),
      modelVersion: Number(version) as DesignConfig['modelVersion'],
    })),
);

for (const config of models) {
  images.add(modelPoster(config));
  const url = modelAsset(config),
    bytes = readFileSync(asset(url));
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF', `${url}: GLB 헤더`);
  assert.equal(bytes.readUInt32LE(4), 2, `${url}: glTF 버전`);
  assert.equal(bytes.readUInt32LE(8), bytes.length, `${url}: 잘린 파일`);
  assert.equal(bytes.toString('ascii', 16, 20), 'JSON', `${url}: JSON 청크`);
  const gltf = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  ) as {
    materials: { name?: string }[];
    meshes: unknown[];
    buffers: { uri?: string }[];
  };
  const parts = new Set(gltf.materials.map(m => m.name?.split('.')[0]));
  for (const part of ['upper', 'panel', 'sole', 'laces'])
    assert.ok(parts.has(part), `${url}: ${part} 재질 누락`);
  assert.ok(gltf.meshes.length > 0, `${url}: 메시 누락`);
  assert.ok(
    gltf.buffers.every(b => !b.uri),
    `${url}: 외부 버퍼 참조`,
  );
  console.log(
    `${url} · ${(bytes.length / 1024 / 1024).toFixed(2)} MiB · ${gltf.meshes.length} meshes`,
  );
}
for (const image of images) asset(image);
console.log(
  `에셋 계약 통과: 상품 ${PRODUCTS.length}종 / 모델 ${models.length}개 / 이미지 참조 ${images.size}개. 조형 품질은 별도 화면 검수 대상.`,
);
