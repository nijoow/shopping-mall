'use client';
import { commerceError, demoRequest, type CommerceError } from './client-api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DemoState } from '@/domain/types';

interface DemoContextValue {
  state: DemoState | null;
  loading: boolean;
  error: CommerceError | null;
  refresh: () => Promise<DemoState | null>;
  mutate: <T = unknown>(op: string, data?: unknown) => Promise<T>;
  notify: (message: string) => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<CommerceError | null>(null),
    [notice, setNotice] = useState('');
  const generation = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    channel = useRef<BroadcastChannel | null>(null),
    busy = useRef(false),
    cooldown = useRef(new Map<string, CommerceError>()),
    mutationQueue = useRef<Promise<unknown>>(Promise.resolve());
  const refresh = useCallback(async () => {
    if (busy.current) return null;
    const current = ++generation.current;
    try {
      const waiting = cooldown.current.get('GET');
      if (waiting?.retryAt && waiting.retryAt > Date.now()) throw waiting;
      const payload = await demoRequest({ cache: 'no-store' });
      if (current === generation.current) {
        setState(payload.state);
        setError(null);
      }
      return payload.state as DemoState;
    } catch (e) {
      const failure = commerceError(e);
      if (failure.retryAt) cooldown.current.set('GET', failure);
      if (current === generation.current) setError(failure);
      return null;
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  const notify = useCallback((message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(''), 4000);
  }, []);
  const mutate = useCallback(
    async <T,>(op: string, data?: unknown): Promise<T> => {
      const task = async () => {
        busy.current = true;
        ++generation.current;
        try {
          const waiting = cooldown.current.get(op);
          if (waiting?.retryAt && waiting.retryAt > Date.now()) throw waiting;
          const payload = await demoRequest<T>({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ op, data }),
          });
          setState(payload.state);
          setError(null);
          channel.current?.postMessage('changed');
          return payload.result as T;
        } catch (error) {
          const failure = commerceError(error);
          if (failure.retryAt) cooldown.current.set(op, failure);
          throw failure;
        } finally {
          busy.current = false;
        }
      };
      const operation = mutationQueue.current.catch(() => undefined).then(task);
      mutationQueue.current = operation;
      return operation;
    },
    [],
  );
  useEffect(() => {
    let mounted = true;
    // StrictMode can mount/clean up twice; only the live subscription bootstraps a session.
    queueMicrotask(() => {
      if (mounted) void refresh();
    });
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('nijoow-editorial');
      channel.current.onmessage = () => void refresh();
    }
    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      channel.current?.close();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refresh]);
  return (
    <DemoContext.Provider
      value={{ state, loading, error, refresh, mutate, notify }}
    >
      {children}
      <div
        className={`toast ${notice ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {notice}
      </div>
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('DemoProvider missing');
  return value;
}
