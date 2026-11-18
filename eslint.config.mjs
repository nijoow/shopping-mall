import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
export default [
  {
    ignores: [
      '.next/**',
      'archive/**',
      'public/**',
      'docs/**',
      'node_modules/**',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];
