'use client';

import { useEffect, useMemo } from 'react';
import { createStore, useStore } from './store';

/**
 * 찜(favorite)·장바구니(cart) 저장 상태.
 * localStorage를 단일 소스로 쓰되, 컴포넌트 간 실시간 동기화를 위해
 * 전역 스토어에 올려두고 마운트 후 한 번만 하이드레이션한다.
 * (SSR 첫 페인트는 빈 상태로 렌더링되어 hydration mismatch가 없다)
 */
export type SavedProductsKey = 'favorite' | 'cart';

type SavedMap = Record<number, boolean>;

interface SavedProductsState {
  isHydrated: boolean;
  favorite: SavedMap;
  cart: SavedMap;
}

const savedProductsStore = createStore<SavedProductsState>({
  isHydrated: false,
  favorite: {},
  cart: {},
});

const readStorage = (key: SavedProductsKey): SavedMap => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    return {};
  }
};

const hydrateFromStorage = () => {
  if (savedProductsStore.getState().isHydrated) return;

  savedProductsStore.setState({
    isHydrated: true,
    favorite: readStorage('favorite'),
    cart: readStorage('cart'),
  });
};

export const toggleSavedProduct = (
  key: SavedProductsKey,
  productId: number,
) => {
  savedProductsStore.setState(state => {
    const next = { ...state[key], [productId]: !state[key][productId] };

    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      // localStorage 접근 불가 환경에서는 메모리 상태만 유지한다
    }

    return { [key]: next };
  });
};

/** 찜/장바구니 저장 상태 구독 훅 — 마운트 후 localStorage와 동기화된다. */
export const useSavedProducts = (key: SavedProductsKey) => {
  useEffect(hydrateFromStorage, []);

  const saved = useStore(savedProductsStore, state => state[key]);
  const isHydrated = useStore(savedProductsStore, state => state.isHydrated);

  const savedIds = useMemo(
    () =>
      Object.entries(saved)
        .filter(([, isSaved]) => isSaved)
        .map(([productId]) => Number(productId)),
    [saved],
  );

  return { saved, savedIds, isHydrated };
};
