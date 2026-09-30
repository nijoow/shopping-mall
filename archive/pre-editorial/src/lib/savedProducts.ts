'use client';

import { useEffect, useMemo } from 'react';
import { createStore, useStore } from './store';

/**
 * 찜(favorite)·장바구니(cart) 저장 상태.
 * localStorage를 단일 소스로 쓰되, 컴포넌트 간 실시간 동기화를 위해
 * 전역 스토어에 올려두고 마운트 후 한 번만 하이드레이션한다.
 * (SSR 첫 페인트는 빈 상태로 렌더링되어 hydration mismatch가 없다)
 *
 * - favorite: productId → boolean 맵 (수량/옵션 없음)
 * - cart: CartItem[] (수량·사이즈 포함, 라인 식별자는 productId+size)
 */
type FavoriteMap = Record<number, boolean>;

export interface CartItem {
  productId: number;
  quantity: number;
  size: string | null;
}

interface SavedState {
  isHydrated: boolean;
  favorite: FavoriteMap;
  cart: CartItem[];
}

const FAVORITE_KEY = 'favorite';
const CART_KEY = 'cart';

const store = createStore<SavedState>({
  isHydrated: false,
  favorite: {},
  cart: [],
});

const readFavorite = (): FavoriteMap => {
  try {
    const raw = window.localStorage.getItem(FAVORITE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

/** 구버전 cart(불린 맵)를 CartItem[]로 마이그레이션하며 읽는다. */
const readCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CartItem[];

    // 구버전: { [productId]: boolean } → CartItem[]
    return Object.entries(parsed as FavoriteMap)
      .filter(([, isInCart]) => isInCart)
      .map(([productId]) => ({
        productId: Number(productId),
        quantity: 1,
        size: null,
      }));
  } catch (error) {
    return [];
  }
};

const persistFavorite = (favorite: FavoriteMap) => {
  try {
    window.localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorite));
  } catch (error) {
    // localStorage 접근 불가 환경에서는 메모리 상태만 유지한다
  }
};

const persistCart = (cart: CartItem[]) => {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // 무시 — 메모리 상태만 유지
  }
};

const hydrateFromStorage = () => {
  if (store.getState().isHydrated) return;

  const cart = readCart();
  persistCart(cart); // 마이그레이션 결과를 즉시 반영해둔다

  store.setState({ isHydrated: true, favorite: readFavorite(), cart });
};

/* ------------------------------- favorite ------------------------------- */

export const toggleFavorite = (productId: number) => {
  store.setState(state => {
    const next = { ...state.favorite, [productId]: !state.favorite[productId] };
    persistFavorite(next);
    return { favorite: next };
  });
};

export const useFavorites = () => {
  useEffect(hydrateFromStorage, []);

  const favorite = useStore(store, state => state.favorite);
  const isHydrated = useStore(store, state => state.isHydrated);

  const favoriteIds = useMemo(
    () =>
      Object.entries(favorite)
        .filter(([, isFav]) => isFav)
        .map(([id]) => Number(id)),
    [favorite],
  );

  return { favorite, favoriteIds, isHydrated };
};

/* --------------------------------- cart --------------------------------- */

const sameLine = (a: CartItem, b: { productId: number; size: string | null }) =>
  a.productId === b.productId && a.size === b.size;

/** 같은 (productId,size) 라인이 있으면 수량 합산, 없으면 추가한다. */
export const addToCart = (item: CartItem) => {
  store.setState(state => {
    const existing = state.cart.find(line => sameLine(line, item));
    const next = existing
      ? state.cart.map(line =>
          sameLine(line, item)
            ? { ...line, quantity: line.quantity + item.quantity }
            : line,
        )
      : [...state.cart, item];
    persistCart(next);
    return { cart: next };
  });
};

export const updateCartQuantity = (
  productId: number,
  size: string | null,
  quantity: number,
) => {
  if (quantity < 1) return;
  store.setState(state => {
    const next = state.cart.map(line =>
      sameLine(line, { productId, size }) ? { ...line, quantity } : line,
    );
    persistCart(next);
    return { cart: next };
  });
};

export const removeFromCart = (productId: number, size: string | null) => {
  store.setState(state => {
    const next = state.cart.filter(
      line => !sameLine(line, { productId, size }),
    );
    persistCart(next);
    return { cart: next };
  });
};

export const clearCart = () => {
  store.setState(() => {
    persistCart([]);
    return { cart: [] };
  });
};

export const useCart = () => {
  useEffect(hydrateFromStorage, []);

  const cart = useStore(store, state => state.cart);
  const isHydrated = useStore(store, state => state.isHydrated);

  const productIds = useMemo(
    () => Array.from(new Set(cart.map(line => line.productId))),
    [cart],
  );
  const totalCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  return { cart, productIds, totalCount, isHydrated };
};
