import { DomainError } from '@/domain/validation';
import type { Store } from './database';

export const VISITOR_LIMITS = {
  create: { maximum: 120, windowMs: 10 * 60 * 1000 },
  save: { maximum: 30, windowMs: 60 * 1000 },
  share: { maximum: 10, windowMs: 60 * 1000 },
  workspaces: 5000,
  designs: 25000,
  shares: 25000,
  workspaceShares: 50,
} as const;

/** Call inside the mutation transaction. Retries/rollbacks preserve atomic counters. */
export async function consumeVisitorLimit(
  store: Store,
  operation: 'create' | 'save' | 'share',
  workspace?: string,
  clock = Date.now(),
) {
  const { maximum, windowMs } = VISITOR_LIMITS[operation];
  const start = Math.floor(clock / windowMs) * windowMs;
  const key =
    operation === 'create' ? 'create:global' : `${operation}:${workspace}`;
  if (operation !== 'create' && !workspace)
    throw new Error('Workspace required for mutation limit.');
  await store.run(
    'INSERT INTO operation_limits VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=excluded.window_start,hits=CASE WHEN operation_limits.window_start=excluded.window_start THEN operation_limits.hits+1 ELSE 1 END',
    [key, start],
  );
  const [counter] = await store.rows(
    'SELECT hits FROM operation_limits WHERE key=?',
    [key],
  );
  if (Number(counter.hits) > maximum) {
    const retryAfter = Math.max(
      1,
      Math.ceil((start + windowMs - clock) / 1000),
    );
    throw new DomainError(
      'RATE_LIMITED',
      '요청이 많아 잠시 기다려야 합니다. 편집 내용을 유지한 채 다시 시도해 주세요.',
      429,
      retryAfter,
    );
  }
}

export async function assertVisitorCapacity(
  store: Store,
  table: 'workspaces' | 'designs' | 'shares',
  workspace?: string,
) {
  const [count] = await store.rows(
    table === 'workspaces'
      ? 'SELECT COUNT(*) AS count FROM workspaces WHERE account_id IS NULL'
      : `SELECT COUNT(*) AS count FROM ${table} JOIN workspaces ON ${table}.workspace_id=workspaces.id WHERE workspaces.account_id IS NULL`,
    [],
  );
  const localCount =
    table === 'shares' && workspace
      ? Number(
          (
            await store.rows(
              'SELECT COUNT(*) AS count FROM shares WHERE workspace_id=?',
              [workspace],
            )
          )[0].count,
        )
      : 0;
  if (
    Number(count.count) >= VISITOR_LIMITS[table] ||
    localCount >= VISITOR_LIMITS.workspaceShares
  ) {
    throw new DomainError(
      'DEMO_CAPACITY',
      table === 'shares' && localCount >= VISITOR_LIMITS.workspaceShares
        ? '공유 링크는 50개까지 보관할 수 있습니다. 기존 링크가 만료되고 정리된 후 다시 시도해 주세요.'
        : '내 공간의 저장 용량이 가득 찼습니다. 편집 내용을 유지한 채 잠시 후 다시 시도해 주세요.',
      429,
      600,
    );
  }
}
