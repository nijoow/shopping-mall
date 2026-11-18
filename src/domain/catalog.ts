export type ModelId = 'runner' | 'low';
export type Part = 'upper' | 'panel' | 'sole' | 'laces';
export type Material = 'mesh' | 'leather' | 'suede';
export interface DesignConfig {
  model: ModelId;
  modelVersion: 1 | 2;
  colors: Record<Part, string>;
  material: Material;
  engraving: string;
}
export const modelAsset = (config: DesignConfig) =>
  `/models/${config.model}-v${config.modelVersion}.glb`;
export const modelPoster = (config: DesignConfig) =>
  config.model === 'low' && config.modelVersion === 2
    ? '/editorial/low-v2.png?v=20260930'
    : `/editorial/${config.model}.png?v=20260910`;
export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'sneakers' | 'clothing' | 'accessories';
  price: number;
  image: string;
  detail: string;
  sizes: string[];
  model?: ModelId;
  colors: string[];
  description: string;
  composition: string;
}
export const PARTS: { id: Part; name: string }[] = [
  { id: 'upper', name: '어퍼' },
  { id: 'panel', name: '패널' },
  { id: 'sole', name: '솔' },
  { id: 'laces', name: '레이스' },
];
export const PALETTE = [
  { color: '#e6e1d7', name: '페이퍼' },
  { color: '#a6a9ac', name: '실버' },
  { color: '#343639', name: '차콜' },
  { color: '#1b1d20', name: '블랙' },
  { color: '#315684', name: '코발트' },
  { color: '#842e32', name: '버건디' },
  { color: '#6c735b', name: '올리브' },
  { color: '#bc9b73', name: '샌드' },
];
export const MATERIALS: { id: Material; name: string; description: string }[] =
  [
    { id: 'mesh', name: '메시', description: '촘촘한 짜임과 가벼운 표면' },
    {
      id: 'leather',
      name: '레더',
      description: '은은한 결이 살아있는 매끈한 표면',
    },
    {
      id: 'suede',
      name: '스웨이드',
      description: '빛을 부드럽게 머금는 매트한 표면',
    },
  ];
export const defaultConfig = (model: ModelId): DesignConfig => ({
  model,
  modelVersion: model === 'low' ? 2 : 1,
  colors:
    model === 'runner'
      ? {
          upper: '#a6a9ac',
          panel: '#343639',
          sole: '#e6e1d7',
          laces: '#e6e1d7',
        }
      : {
          upper: '#e6e1d7',
          panel: '#e6e1d7',
          sole: '#bc9b73',
          laces: '#e6e1d7',
        },
  material: model === 'runner' ? 'mesh' : 'leather',
  engraving: '',
});
export const PRESETS = [
  { id: 'original', name: 'ORIGINAL', color: '#a6a9ac' },
  { id: 'paper', name: 'PAPER', color: '#e6e1d7' },
  { id: 'cobalt', name: 'COBALT', color: '#315684' },
  { id: 'night', name: 'NIGHT', color: '#343639' },
] as const;
export function presetConfig(model: ModelId, preset: string): DesignConfig {
  const config = defaultConfig(model);
  if (preset === 'paper')
    config.colors = {
      upper: '#e6e1d7',
      panel: '#bc9b73',
      sole: '#e6e1d7',
      laces: '#e6e1d7',
    };
  if (preset === 'cobalt')
    config.colors = {
      upper: '#a6a9ac',
      panel: '#315684',
      sole: '#e6e1d7',
      laces: '#315684',
    };
  if (preset === 'night')
    config.colors = {
      upper: '#343639',
      panel: '#1b1d20',
      sole: '#343639',
      laces: '#a6a9ac',
    };
  return config;
}
const shoes = ['250', '260', '270', '280', '290'];
const apparel = ['S', 'M', 'L', 'XL'];
export const PRODUCTS: Product[] = [
  {
    id: 'runner',
    name: 'FORM RUNNER',
    subtitle: '움직임을 위한 새로운 균형',
    category: 'sneakers',
    model: 'runner',
    price: 219000,
    sizes: shoes,
    image: '/editorial/runner.png?v=20260910',
    detail: '/editorial/runner-detail.png?v=20260910',
    colors: ['#a6a9ac', '#343639', '#315684'],
    description:
      '부드러운 곡선과 겹쳐진 패널, 서로 다른 표면이 만들어내는 입체감. 내 취향의 색과 재질로 완성하는 러너.',
    composition:
      '어퍼 · 패널 · 미드솔 · 레이스를 개별 편집할 수 있는 데모 스니커즈.',
  },
  {
    id: 'low',
    name: 'EVERYDAY LOW',
    subtitle: '매일의 장면에 자연스럽게',
    category: 'sneakers',
    model: 'low',
    price: 179000,
    sizes: shoes,
    image: '/editorial/low-v2.png?v=20260930',
    detail: '/editorial/low-detail-v2.png?v=20260930',
    colors: ['#e6e1d7', '#bc9b73', '#343639'],
    description:
      '단정한 비율과 낮은 실루엣, 은은한 표면의 결. 절제된 디테일 위에 나만의 한 줄을 더하는 로우탑.',
    composition:
      '부드러운 어퍼와 독립된 솔, 레이스로 구성한 오리지널 데모 모델.',
  },
  {
    id: 'field-jacket',
    name: 'FIELD JACKET',
    subtitle: '여유로운 형태, 차분한 디테일',
    category: 'clothing',
    price: 189000,
    sizes: apparel,
    image: '/editorial/jacket-photo.png?v=20260910',
    detail: '/editorial/jacket-photo.png?v=20260910',
    colors: ['#464b45'],
    description:
      '가볍게 걸쳐도 실루엣이 살아나는 필드 재킷. 스니커즈와 함께 균형을 만드는 차분한 올리브 컬러.',
    composition:
      '포트폴리오를 위한 가상 컬렉션. 사이즈와 가격은 쇼핑 체험용이야.',
  },
  {
    id: 'crew-knit',
    name: 'SOFT CREW',
    subtitle: '부드러운 질감의 일상',
    category: 'clothing',
    price: 89000,
    sizes: apparel,
    image: '/editorial/knit-photo.png?v=20260910',
    detail: '/editorial/knit-photo.png?v=20260910',
    colors: ['#b8ac97'],
    description:
      '조금 여유 있는 어깨와 단정한 넥 라인. 따뜻한 페이퍼 톤으로 컬렉션을 연결하는 크루넥.',
    composition: '포트폴리오를 위한 가상 컬렉션. 실제 제조·판매 상품이 아니야.',
  },
  {
    id: 'wide-trouser',
    name: 'WIDE TROUSER',
    subtitle: '자연스럽게 떨어지는 선',
    category: 'clothing',
    price: 119000,
    sizes: apparel,
    image: '/editorial/trouser-photo-v2.png',
    detail: '/editorial/trouser-photo-v2.png',
    colors: ['#4c4c4a'],
    description:
      '발끝까지 여유롭게 이어지는 실루엣. 볼륨 러너와 낮은 로우탑, 어느 쪽에도 자연스럽게 어울려.',
    composition:
      '포트폴리오용 가상 제품. 실제 착용감과 제조 사양을 보증하지 않아.',
  },
  {
    id: 'crossbody',
    name: 'DAILY CROSSBODY',
    subtitle: '필요한 것만 가볍게',
    category: 'accessories',
    price: 69000,
    sizes: ['ONE SIZE'],
    image: '/editorial/bag-photo.png?v=20260910',
    detail: '/editorial/bag-photo.png?v=20260910',
    colors: ['#272b2b'],
    description:
      '단정한 수납 공간과 넓은 스트랩. 일상의 움직임을 따라가는 컴팩트한 크로스백.',
    composition: '데모 컬렉션. 옵션·장바구니·모의 주문을 체험할 수 있어.',
  },
  {
    id: 'everyday-cap',
    name: 'EVERYDAY CAP',
    subtitle: '룩의 마지막 작은 포인트',
    category: 'accessories',
    price: 39000,
    sizes: ['ONE SIZE'],
    image: '/editorial/cap-photo-v2.png',
    detail: '/editorial/cap-photo-v2.png',
    colors: ['#7d816e'],
    description:
      '낮은 크라운과 부드러운 챙. 과하지 않은 올리브 톤으로 나만의 조합을 완성해.',
    composition: '데모 컬렉션. 실제 결제와 배송은 발생하지 않아.',
  },
];
export const findProduct = (id: string) => PRODUCTS.find(p => p.id === id);
export const money = (value: number) =>
  `₩${new Intl.NumberFormat('ko-KR').format(value)}`;
export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING = 150000;
export const MAX_QUANTITY = 5;
export function unitPrice(product: Product, config: DesignConfig | null) {
  if (!config || !product.model) return product.price;
  const base = defaultConfig(product.model).material;
  const materialFee =
    config.material === base ? 0 : config.material === 'suede' ? 15000 : 10000;
  return product.price + materialFee + (config.engraving ? 5000 : 0);
}
export const PART_LABELS = Object.fromEntries(
  PARTS.map(p => [p.id, p.name]),
) as Record<Part, string>;
