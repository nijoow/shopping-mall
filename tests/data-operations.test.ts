import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DemoRepository } from '../src/server/repository';
import { databaseConfiguration } from '../src/server/database-config';
import { consumeGuestLimit, GUEST_LIMITS } from '../src/server/guest-limits';
import { planRetention, applyRetention } from '../src/server/data-retention';
import { backupSqlite, restoreSqlite } from '../src/server/data-backup';
import {
  defaultConfig,
  FREE_SHIPPING,
  SHIPPING_FEE,
} from '../src/domain/catalog';

const design = (id = randomUUID()) => ({
  id,
  name: 'Snapshot',
  config: defaultConfig('low'),
  version: 0,
});

test('blank settings normalize, cloud fails closed, and isolated SQLite overrides ambient deployment settings', () => {
  assert.equal(
    databaseConfiguration({
      NIJOOW_POSTGRES_URL: '  ',
      POSTGRES_URL: 'postgres://cloud/db',
      VERCEL: '1',
    }).kind,
    'postgres',
  );
  assert.equal(
    databaseConfiguration({
      NIJOOW_POSTGRES_URL: ' ',
      POSTGRES_URL: 'postgres://production/db',
      VERCEL: '',
    }).kind,
    'sqlite',
  );
  assert.deepEqual(
    databaseConfiguration({
      NIJOOW_POSTGRES_URL: ' postgres://explicit/db ',
      VERCEL: '1',
    }),
    { kind: 'postgres', url: 'postgres://explicit/db' },
  );
  assert.throws(
    () => databaseConfiguration({ VERCEL: ' 1 ', POSTGRES_URL: ' ' }),
    /configured/,
  );
  assert.throws(
    () => databaseConfiguration({ NIJOOW_TEST_SQLITE_ONLY: '1' }),
    /explicit database path/,
  );
  assert.deepEqual(
    databaseConfiguration({
      NIJOOW_TEST_SQLITE_ONLY: '1',
      NIJOOW_DEMO_DB_PATH: ':memory:',
      VERCEL: '1',
      NIJOOW_POSTGRES_URL: 'postgres://production/db',
    }),
    { kind: 'sqlite', path: ':memory:' },
  );
});

test('concurrent guest saves/shares stop at transactional limits and retain the last successful snapshot', async () => {
  const repo = new DemoRepository(':memory:');
  try {
    const w = await repo.workspace();
    const results = await Promise.allSettled(
      Array.from({ length: 35 }, () => repo.saveDesign(w.id, design())),
    );
    assert.equal(
      results.filter(r => r.status === 'fulfilled').length,
      GUEST_LIMITS.save.maximum,
    );
    for (const r of results.filter(r => r.status === 'rejected')) {
      assert.equal(r.reason.code, 'RATE_LIMITED');
      assert.equal(r.reason.status, 429);
      assert.ok(r.reason.retryAfter >= 1 && r.reason.retryAfter <= 60);
    }
    const saved = (await repo.state(w.id)).designs[0];
    await assert.rejects(
      repo.saveDesign(w.id, {
        id: saved.id,
        version: saved.version,
        config: saved.config,
        name: 'Rejected update',
      }),
      { code: 'RATE_LIMITED', status: 429 },
    );
    assert.equal(
      (await repo.state(w.id)).designs.find(d => d.id === saved.id)!.name,
      'Snapshot',
    );
    const shares = await Promise.allSettled(
      Array.from({ length: 13 }, () => repo.share(w.id, saved.id)),
    );
    assert.equal(
      shares.filter(r => r.status === 'fulfilled').length,
      GUEST_LIMITS.share.maximum,
    );
    assert.equal(
      (await repo.row('SELECT COUNT(*) AS count FROM operation_limits'))!.count,
      3,
    );
    await repo.run(
      'UPDATE operation_limits SET window_start=0 WHERE key=?',
      `save:${w.id}`,
    );
    const recovered = await repo.saveDesign(w.id, {
      id: saved.id,
      version: saved.version,
      config: saved.config,
      name: 'Recovered',
    });
    assert.equal(recovered.version, saved.version + 1);
    assert.equal(recovered.name, 'Recovered');
  } finally {
    await repo.close();
  }
});

test('creation window expires, guest storage has caps, and member mutations bypass anonymous rate limits', async () => {
  const repo = new DemoRepository(':memory:');
  try {
    const clock = 1800000000000;
    for (let i = 0; i < GUEST_LIMITS.create.maximum; i++) {
      await repo.transaction(() =>
        consumeGuestLimit(repo.store, 'create', undefined, clock),
      );
    }
    await assert.rejects(
      repo.transaction(() =>
        consumeGuestLimit(repo.store, 'create', undefined, clock),
      ),
      { code: 'RATE_LIMITED', status: 429 },
    );
    await repo.transaction(() =>
      consumeGuestLimit(
        repo.store,
        'create',
        undefined,
        clock + GUEST_LIMITS.create.windowMs,
      ),
    );
    const w = await repo.workspace();
    const d = await repo.saveDesign(w.id, design());
    for (let i = 0; i < 50; i++)
      await repo.run(
        'INSERT INTO shares VALUES(?,?,?,?)',
        `share-${i}`,
        w.id,
        JSON.stringify({ name: d.name, config: d.config }),
        '2099-01-01T00:00:00.000Z',
      );
    await assert.rejects(repo.share(w.id, d.id), {
      code: 'DEMO_CAPACITY',
      status: 429,
    });
    const account = await repo.account('test', randomUUID(), 'Member');
    const member = await repo.workspace(w.token, account);
    const updates = await Promise.allSettled(
      Array.from({ length: 31 }, () => repo.saveDesign(member.id, design())),
    );
    assert.equal(updates.filter(r => r.status === 'fulfilled').length, 31);
  } finally {
    await repo.close();
  }
});

test('global guest volume cap does not mint another token or affect existing members', async () => {
  const repo = new DemoRepository(':memory:');
  try {
    const account = await repo.account('test', randomUUID(), 'Member');
    const member = await repo.workspace(undefined, account);
    await repo.run(
      "WITH RECURSIVE counter(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM counter WHERE n<5000) INSERT INTO workspaces SELECT 'guest-' || n,'token-' || n,NULL,? FROM counter",
      new Date().toISOString(),
    );
    await assert.rejects(repo.workspace(), {
      code: 'DEMO_CAPACITY',
      status: 429,
    });
    assert.equal((await repo.workspace(member.token, account)).id, member.id);
    assert.equal(
      (await repo.row('SELECT COUNT(*) AS count FROM workspaces'))!.count,
      5001,
    );
  } finally {
    await repo.close();
  }
});

test('retention dry-run and transactional rechecks preserve accounts, recent guests and active shares', async () => {
  const repo = new DemoRepository(':memory:');
  try {
    const clock = Date.now();
    const stale = new Date(clock - 8 * 86400000).toISOString();
    const boundary = new Date(clock - 7 * 86400000).toISOString();
    const guest = await repo.workspace();
    const activeShareGuest = await repo.workspace();
    const adopted = await repo.workspace();
    const touched = await repo.workspace();
    const newlyShared = await repo.workspace();
    const exactBoundary = await repo.workspace();
    const memberAccount = await repo.account('test', randomUUID(), 'Member');
    const member = await repo.workspace(undefined, memberAccount);
    for (const w of [
      guest,
      activeShareGuest,
      adopted,
      touched,
      newlyShared,
      member,
    ]) {
      await repo.saveDesign(w.id, design());
      await repo.run(
        'UPDATE workspaces SET updated_at=? WHERE id=?',
        stale,
        w.id,
      );
    }
    await repo.run(
      'UPDATE workspaces SET updated_at=? WHERE id=?',
      boundary,
      exactBoundary.id,
    );
    const activeId = (await repo.state(activeShareGuest.id)).designs[0].id;
    const shared = await repo.share(activeShareGuest.id, activeId);
    const expired = await repo.share(
      guest.id,
      (await repo.state(guest.id)).designs[0].id,
    );
    await repo.run(
      'UPDATE shares SET expires_at=? WHERE token=?',
      new Date(clock - 1).toISOString(),
      expired,
    );
    const plan = await planRetention(repo.store, 100, clock);
    assert.deepEqual(
      new Set(plan.guests.map(g => g.id)),
      new Set([guest.id, adopted.id, touched.id, newlyShared.id]),
    );
    assert.equal((await repo.state(guest.id)).designs.length, 1); // dry-run did not remove records
    await repo.run(
      'UPDATE workspaces SET account_id=? WHERE id=?',
      memberAccount,
      adopted.id,
    );
    await repo.run(
      'UPDATE workspaces SET updated_at=? WHERE id=?',
      new Date(clock).toISOString(),
      touched.id,
    );
    const newShare = await repo.share(
      newlyShared.id,
      (await repo.state(newlyShared.id)).designs[0].id,
    );
    const result = await applyRetention(repo.store, plan, clock);
    assert.deepEqual(result, {
      deletedGuests: 1,
      deletedShares: 1,
      skippedGuests: 3,
      skippedShares: 0,
    });
    assert.equal(
      await repo.row('SELECT id FROM workspaces WHERE id=?', guest.id),
      undefined,
    );
    for (const w of [adopted, touched, member, activeShareGuest, exactBoundary])
      assert.ok(await repo.row('SELECT id FROM workspaces WHERE id=?', w.id));
    assert.equal(
      (await repo.shared(shared))!.config.modelVersion,
      defaultConfig('low').modelVersion,
    );
    assert.equal((await repo.state(member.id)).designs.length, 1);
    assert.ok(await repo.shared(newShare));
    await assert.rejects(
      applyRetention(
        repo.store,
        { ...plan, guests: Array.from({ length: 101 }, () => plan.guests[0]) },
        clock,
      ),
    );
    await assert.rejects(
      applyRetention(repo.store, plan, clock + 2 * 86400000),
      /last 24 hours/,
    );
  } finally {
    await repo.close();
  }
});

test('expiry denies guest adoption while a live shared version survives guest cleanup planning', async () => {
  const repo = new DemoRepository(':memory:');
  try {
    const w = await repo.workspace();
    const d = await repo.saveDesign(w.id, design());
    const share = await repo.share(w.id, d.id);
    await repo.run(
      'UPDATE workspaces SET updated_at=? WHERE id=?',
      new Date(Date.now() - 8 * 86400000).toISOString(),
      w.id,
    );
    const account = await repo.account('test', randomUUID(), 'Member');
    const adopted = await repo.workspace(w.token, account);
    assert.notEqual(adopted.id, w.id);
    assert.equal((await repo.state(adopted.id)).designs.length, 0);
    assert.ok(await repo.shared(share));
    assert.equal((await planRetention(repo.store)).guests.length, 0);
    await repo.run(
      'UPDATE shares SET expires_at=? WHERE token=?',
      new Date(Date.now() - 1).toISOString(),
      share,
    );
    assert.equal(await repo.shared(share), null);
  } finally {
    await repo.close();
  }
});

test('online SQLite backup restores member orders and versioned design/share snapshots into an unused path', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nijoow-backup-test-'));
  const source = join(directory, 'source.sqlite');
  const backup = join(directory, 'backup.sqlite');
  const restored = join(directory, 'restored.sqlite');
  const repo = new DemoRepository(source);
  let recovered: DemoRepository | undefined;
  try {
    const account = await repo.account('test', randomUUID(), 'Restore member');
    const w = await repo.workspace(undefined, account);
    const saved = await repo.saveDesign(w.id, design());
    const shared = await repo.share(w.id, saved.id);
    const line = await repo.addCart(w.id, {
      productId: 'low',
      size: '270',
      quantity: 1,
      config: saved.config,
    });
    const state = await repo.state(w.id);
    const total = state.cart[0].unitPrice;
    const order = await repo.checkout(w.id, {
      requestKey: randomUUID(),
      lineIds: [line],
      addressId: 'studio',
      quotedTotal: total >= FREE_SHIPPING ? total : total + SHIPPING_FEE,
      scenario: 'success',
    });
    const counts = await backupSqlite(source, backup);
    assert.equal(counts.orders, 1);
    assert.deepEqual(await restoreSqlite(backup, restored), counts);
    await assert.rejects(restoreSqlite(backup, source), { code: 'EEXIST' });
    await assert.rejects(backupSqlite(source, backup), { code: 'EEXIST' });
    recovered = new DemoRepository(restored);
    const restoredState = await recovered.state(w.id);
    assert.equal(restoredState.signedIn, true);
    assert.deepEqual(restoredState.orders[0], order);
    assert.deepEqual(restoredState.designs, (await repo.state(w.id)).designs);
    assert.deepEqual(await recovered.shared(shared), await repo.shared(shared));
  } finally {
    await recovered?.close();
    await repo.close();
    await rm(directory, { recursive: true, force: true });
  }
});
