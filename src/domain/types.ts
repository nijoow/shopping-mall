import type { DesignConfig, Product } from './catalog';
export interface CartLine {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  config: DesignConfig | null;
  product: Product;
  unitPrice: number;
  stock: number;
  preview?: string | null;
}
export interface SavedDesign {
  id: string;
  name: string;
  config: DesignConfig;
  version: number;
  updatedAt: string;
  preview?: string | null;
}
export type OrderStatus =
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'REFUNDED';
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  config: DesignConfig | null;
  preview?: string | null;
}
export interface DemoOrder {
  id: string;
  number: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  address: string;
  createdAt: string;
  events: { status: OrderStatus; at: string }[];
  requestKey: string;
}
export interface DemoState {
  workspaceId: string;
  signedIn: boolean;
  name: string;
  favorites: string[];
  cart: CartLine[];
  designs: SavedDesign[];
  orders: DemoOrder[];
}
export const STATUS_LABEL: Record<OrderStatus, string> = {
  CONFIRMED: '주문 확정',
  PREPARING: '출고 준비',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소 · 모의 환불 완료',
  RETURN_REQUESTED: '반품 신청',
  REFUNDED: '반품 · 모의 환불 완료',
};
export const ADDRESSES = [
  {
    id: 'studio',
    name: 'NIJOOW 스튜디오',
    text: '[00000] 가상도시 편집로 01, NIJOOW 스튜디오',
  },
  {
    id: 'home',
    name: '나의 데모 주소',
    text: '[00000] 가상도시 일상로 02, 데모 하우스',
  },
] as const;
