'use client';

import { useSyncExternalStore } from 'react';

/**
 * 의존성 없는 초경량 외부 스토어.
 * React 18의 useSyncExternalStore 기반 — zustand 없이 동일한 사용성을 제공한다.
 */
export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
}

export const createStore = <T,>(initialState: T): Store<T> => {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: partial => {
      const next = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...next };
      listeners.forEach(listener => listener());
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

/** 셀렉터 기반 구독 훅 — 선택한 값이 바뀔 때만 리렌더 */
export const useStore = <T, U>(store: Store<T>, selector: (state: T) => U): U =>
  useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
