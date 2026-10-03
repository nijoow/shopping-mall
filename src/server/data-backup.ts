import { DatabaseSync } from 'node:sqlite';
import { open, copyFile, chmod, unlink } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

export function verifySqlite(path: string) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const integrity = db.prepare('PRAGMA integrity_check').all();
    if (integrity.length !== 1 || Object.values(integrity[0])[0] !== 'ok')
      throw new Error('SQLite integrity verification failed.');
    if (db.prepare('PRAGMA foreign_key_check').all().length)
      throw new Error('SQLite foreign-key verification failed.');
    const counts: Record<string, number> = {};
    for (const table of [
      'accounts',
      'workspaces',
      'designs',
      'orders',
      'shares',
    ]) {
      counts[table] = Number(
        db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()!.count,
      );
    }
    return counts;
  } finally {
    db.close();
  }
}

/** VACUUM INTO includes committed WAL content without copying an active WAL file. */
export async function backupSqlite(source: string, destination: string) {
  if (resolve(source) === resolve(destination))
    throw new Error('Backup source and destination must differ.');
  const reservation = await open(destination, 'wx', 0o600);
  await reservation.close();
  let db: DatabaseSync | undefined;
  try {
    db = new DatabaseSync(source, { readOnly: true });
    db.prepare('VACUUM INTO ?').run(resolve(destination));
    return verifySqlite(destination);
  } catch (error) {
    await unlink(destination);
    throw error;
  } finally {
    db?.close();
  }
}

/** Restore only into a new path. The running application remains on its existing file. */
export async function restoreSqlite(source: string, destination: string) {
  verifySqlite(source);
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  try {
    await chmod(destination, 0o600);
    return verifySqlite(destination);
  } catch (error) {
    await unlink(destination);
    throw error;
  }
}
