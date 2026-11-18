import { z } from 'zod';
import type { Store } from './database';

const timestamp = z.string().datetime();
export const retentionPlanSchema = z
  .object({
    version: z.literal(1),
    asOf: timestamp,
    cutoff: timestamp,
    batch: z.number().int().min(1).max(100),
    guests: z
      .array(z.object({ id: z.string().uuid(), updatedAt: timestamp }).strict())
      .max(100),
    shares: z
      .array(
        z
          .object({ token: z.string().min(1).max(80), expiresAt: timestamp })
          .strict(),
      )
      .max(100),
  })
  .strict()
  .superRefine((plan, ctx) => {
    if (
      Date.parse(plan.cutoff) !== Date.parse(plan.asOf) - 7 * 86400000 ||
      plan.guests.length > plan.batch ||
      plan.shares.length > plan.batch ||
      new Set(plan.guests.map(g => g.id)).size !== plan.guests.length ||
      new Set(plan.shares.map(s => s.token)).size !== plan.shares.length
    ) {
      ctx.addIssue({ code: 'custom', message: 'Invalid retention scope.' });
    }
  });
export type RetentionPlan = z.infer<typeof retentionPlanSchema>;

/** Read-only, capped manifest. No accounts, payloads, cookie hashes or model files. */
export async function planRetention(
  store: Store,
  batch = 50,
  clock = Date.now(),
): Promise<RetentionPlan> {
  z.number().int().min(1).max(100).parse(batch);
  const asOf = new Date(clock).toISOString();
  const cutoff = new Date(clock - 7 * 86400000).toISOString();
  const guests = await store.rows(
    'SELECT id,updated_at FROM workspaces WHERE account_id IS NULL AND updated_at<? AND NOT EXISTS (SELECT 1 FROM shares WHERE shares.workspace_id=workspaces.id AND expires_at>?) ORDER BY updated_at,id LIMIT ?',
    [cutoff, asOf, batch],
  );
  const shares = await store.rows(
    'SELECT token,expires_at FROM shares WHERE expires_at<=? ORDER BY expires_at,token LIMIT ?',
    [asOf, batch],
  );
  return {
    version: 1,
    asOf,
    cutoff,
    batch,
    guests: guests.map(r => ({
      id: String(r.id),
      updatedAt: String(r.updated_at),
    })),
    shares: shares.map(r => ({
      token: String(r.token),
      expiresAt: String(r.expires_at),
    })),
  };
}

export async function applyRetention(
  store: Store,
  input: unknown,
  clock = Date.now(),
) {
  const plan = retentionPlanSchema.parse(input);
  if (
    Date.parse(plan.asOf) > clock ||
    clock - Date.parse(plan.asOf) > 86400000
  ) {
    throw new Error(
      'Retention manifest must be from the last 24 hours. Create another dry-run.',
    );
  }
  const result = {
    deletedGuests: 0,
    deletedShares: 0,
    skippedGuests: 0,
    skippedShares: 0,
  };
  for (const target of plan.shares) {
    const deleted = await store.transaction(() =>
      store.run(
        'DELETE FROM shares WHERE token=? AND expires_at=? AND expires_at<=?',
        [target.token, target.expiresAt, plan.asOf],
      ),
    );
    if (deleted.changes) result.deletedShares++;
    else result.skippedShares++;
  }
  for (const target of plan.guests) {
    const deleted = await store.transaction(async () => {
      const [guest] = await store.rows(
        'SELECT id FROM workspaces WHERE id=? AND account_id IS NULL AND updated_at=? AND updated_at<? AND NOT EXISTS (SELECT 1 FROM shares WHERE shares.workspace_id=workspaces.id)',
        [target.id, target.updatedAt, plan.cutoff],
      );
      // Adoption, activity, or remaining snapshots always wins over an old plan.
      if (!guest) return false;
      for (const table of [
        'cart',
        'favorites',
        'designs',
        'inventory',
        'orders',
      ]) {
        await store.run(`DELETE FROM ${table} WHERE workspace_id=?`, [
          target.id,
        ]);
      }
      await store.run('DELETE FROM operation_limits WHERE key IN (?,?)', [
        `save:${target.id}`,
        `share:${target.id}`,
      ]);
      return (
        (
          await store.run(
            'DELETE FROM workspaces WHERE id=? AND account_id IS NULL AND updated_at=?',
            [target.id, target.updatedAt],
          )
        ).changes === 1
      );
    });
    if (deleted) result.deletedGuests++;
    else result.skippedGuests++;
  }
  return result;
}
