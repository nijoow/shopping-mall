'use client';
import * as THREE from 'three';
import type { Material } from '@/domain/catalog';

/** Deterministic, locally generated PBR surfaces; no texture CDN or paid service. */
export function createSurface(kind: Material) {
  const size = 256,
    height = new Float32Array(size * size);
  let seed = kind === 'leather' ? 47 : kind === 'suede' ? 103 : 211;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 4294967296;
      height[y * size + x] =
        kind === 'mesh'
          ? (Math.cos(x * 0.85) * Math.cos(y * 0.85) + 1) * 0.32 + noise * 0.12
          : kind === 'leather'
            ? noise * 0.25
            : noise * 0.65;
    }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!,
    pixels = context.createImageData(size, size);
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = normalCanvas.height = size;
  const normalContext = normalCanvas.getContext('2d')!,
    normals = normalContext.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = y * size + x,
        p = i * 4;
      const h = height[i];
      const dx = height[y * size + ((x + 1) % size)] - h,
        dy = height[((y + 1) % size) * size + x] - h;
      const value = kind === 'mesh' ? 185 + h * 90 : 230 + h * 30;
      pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = value;
      pixels.data[p + 3] = 255;
      normals.data[p] = 128 + dx * 110;
      normals.data[p + 1] = 128 + dy * 110;
      normals.data[p + 2] = 250;
      normals.data[p + 3] = 255;
    }
  context.putImageData(pixels, 0, 0);
  normalContext.putImageData(normals, 0, 0);
  const map = new THREE.CanvasTexture(canvas),
    normal = new THREE.CanvasTexture(normalCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const texture of [map, normal]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(kind === 'mesh' ? 9 : 5, kind === 'mesh' ? 9 : 5);
  }
  return {
    map,
    normal,
    dispose() {
      map.dispose();
      normal.dispose();
    },
  };
}
