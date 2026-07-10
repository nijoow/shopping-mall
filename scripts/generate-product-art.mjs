/**
 * NIJOOW ORIGINALS 스니커즈 제품 아트(SVG) 생성기
 * 3D 커스텀 랩의 시그니처 컬러웨이를 플랫 벡터 스타일로 렌더링한다.
 *
 *   node scripts/generate-product-art.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'products');

const PRESETS = [
  {
    slug: 'volt-runner',
    name: 'VOLT RUNNER',
    tag: '01',
    background: '#101014',
    paper: false,
    colors: {
      main: '#26262c',
      sole: '#f4f2ec',
      bottom: '#d7ff00',
      accent: '#d7ff00',
      laces: '#d7ff00',
    },
  },
  {
    slug: 'seoul-night',
    name: 'SEOUL NIGHT',
    tag: '02',
    background: '#0d0b14',
    paper: false,
    colors: {
      main: '#1b1b26',
      sole: '#22d3ee',
      bottom: '#101018',
      accent: '#ff2e88',
      laces: '#f4f2ec',
    },
  },
  {
    slug: 'og-paper',
    name: 'OG PAPER',
    tag: '93',
    background: '#eeeade',
    paper: true,
    colors: {
      main: '#f0ede3',
      sole: '#ffffff',
      bottom: '#c8a06a',
      accent: '#1c1c1f',
      laces: '#e0dccc',
    },
  },
  {
    slug: 'concrete',
    name: 'CONCRETE',
    tag: '88',
    background: '#17181c',
    paper: false,
    colors: {
      main: '#9ca3af',
      sole: '#d1d5db',
      bottom: '#1f2937',
      accent: '#4b5563',
      laces: '#e5e7eb',
    },
  },
];

const buildSvg = ({ name, tag, background, paper, colors }) => {
  const ink = paper ? '#1c1c1f' : '#f4f2ec';
  const faint = paper ? 'rgba(28,28,31,0.12)' : 'rgba(244,242,236,0.10)';
  const swatches = [colors.main, colors.accent, colors.bottom];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="${background}"/>

  <!-- 배경 그리드 -->
  <g stroke="${faint}" stroke-width="2">
    <line x1="0" y1="700" x2="900" y2="640"/>
    <line x1="0" y1="820" x2="900" y2="700"/>
    <line x1="620" y1="900" x2="900" y2="530"/>
  </g>

  <!-- 태그 넘버 (아웃라인 타이포) -->
  <text x="860" y="250" text-anchor="end" font-family="Arial Black, Arial, sans-serif"
    font-size="230" font-weight="900" fill="none" stroke="${colors.accent}"
    stroke-width="4" opacity="0.9" letter-spacing="6">${tag}</text>

  <!-- 스니커즈 (측면 실루엣, 토 방향 →) -->
  <g transform="translate(20,60) rotate(-2 450 420)">
    <!-- 아웃솔 -->
    <path d="M130 612 L700 612 Q770 610 776 566 Q778 546 748 542 L150 556 Q126 558 126 586 Q126 606 130 612 Z"
      fill="${colors.bottom}"/>
    <!-- 미드솔 -->
    <path d="M150 556 L748 542 Q772 538 766 514 Q760 494 730 492 L170 508 Q144 510 142 534 Q141 552 150 556 Z"
      fill="${colors.sole}"/>
    <!-- 어퍼 바디 -->
    <path d="M170 508 C160 464 162 424 178 392 L216 346 Q252 352 274 330 L298 296 Q318 268 352 274 L372 298 L560 428 Q642 466 700 480 Q726 486 730 492 L170 508 Z"
      fill="${colors.main}"/>
    <!-- 힐 쿼터 패널 -->
    <path d="M170 508 C160 464 162 424 178 392 L216 346 L302 358 L292 502 Z"
      fill="${colors.accent}" opacity="0.9"/>
    <!-- 사이드 스트라이프 -->
    <path d="M310 466 L560 486 L534 444 L328 426 Z" fill="${colors.accent}"/>
    <!-- 레이스 -->
    <g stroke="${colors.laces}" stroke-width="14" stroke-linecap="round">
      <line x1="367" y1="379" x2="395" y2="326"/>
      <line x1="425" y1="409" x2="452" y2="356"/>
      <line x1="482" y1="439" x2="510" y2="386"/>
    </g>
    <!-- 토 캡 -->
    <path d="M730 492 Q726 486 700 480 Q660 470 626 462 L616 506 Z"
      fill="${ink}" opacity="0.14"/>
  </g>

  <!-- 라벨 -->
  <text x="64" y="756" font-family="Arial Black, Arial, sans-serif" font-size="26"
    font-weight="900" letter-spacing="10" fill="${paper ? '#6b6656' : 'rgba(244,242,236,0.55)'}">NIJOOW ORIGINALS</text>
  <text x="60" y="828" font-family="Arial Black, Arial, sans-serif" font-size="62"
    font-weight="900" letter-spacing="2" fill="${ink}">${name}</text>

  <!-- 컬러 스와치 -->
  <g transform="translate(64,852)">
    ${swatches
      .map(
        (color, index) =>
          `<rect x="${index * 34}" y="0" width="24" height="24" fill="${color}" stroke="${faint}" stroke-width="2"/>`,
      )
      .join('\n    ')}
  </g>
</svg>
`;
};

mkdirSync(OUT_DIR, { recursive: true });

PRESETS.forEach(preset => {
  const file = path.join(OUT_DIR, `${preset.slug}.svg`);
  writeFileSync(file, buildSvg(preset));
  console.log(`generated: ${path.relative(process.cwd(), file)}`);
});
