import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultDatabasePath = path.join(rootDir, '.localcode', 'localcode.db');

export function createStore(databasePath = defaultDatabasePath) {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA journal_mode = WAL');
  database.exec('PRAGMA busy_timeout = 5000');
  database.exec(`
    CREATE TABLE IF NOT EXISTS solutions (
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (problem_id, language)
    );

    CREATE TABLE IF NOT EXISTS progress (
      problem_id TEXT PRIMARY KEY,
      status TEXT,
      seconds INTEGER NOT NULL DEFAULT 0,
      last_passed_at TEXT,
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      mode TEXT NOT NULL,
      passed INTEGER NOT NULL,
      passed_count INTEGER NOT NULL DEFAULT 0,
      total_count INTEGER NOT NULL DEFAULT 0,
      stage TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS attempts_problem_created_idx
      ON attempts(problem_id, created_at DESC);
  `);

  const upsertSolution = database.prepare(`
    INSERT INTO solutions(problem_id, language, code, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(problem_id, language) DO UPDATE SET
      code = excluded.code,
      updated_at = excluded.updated_at
  `);

  const upsertProgress = database.prepare(`
    INSERT INTO progress(problem_id, status, seconds, last_passed_at, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(problem_id) DO UPDATE SET
      status = excluded.status,
      seconds = excluded.seconds,
      last_passed_at = excluded.last_passed_at,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);

  const insertAttempt = database.prepare(`
    INSERT INTO attempts(
      problem_id, language, mode, passed, passed_count, total_count, stage, duration_ms, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  function saveSolution({ problemId, language, code }) {
    const updatedAt = new Date().toISOString();
    upsertSolution.run(String(problemId), language, code, updatedAt);
    return { problemId: String(problemId), language, code, updatedAt };
  }

  function saveProgress({ problemId, status = null, seconds = 0, lastPassedAt = null, notes = '' }) {
    const updatedAt = new Date().toISOString();
    upsertProgress.run(
      String(problemId),
      status,
      Math.max(0, Math.floor(Number(seconds) || 0)),
      lastPassedAt,
      notes,
      updatedAt
    );
    return { problemId: String(problemId), status, seconds, lastPassedAt, notes, updatedAt };
  }

  function recordAttempt({ problemId, language, mode, result, durationMs }) {
    insertAttempt.run(
      String(problemId),
      language,
      mode,
      result.ok ? 1 : 0,
      result.passedCount ?? 0,
      result.totalCount ?? 0,
      result.stage ?? 'unknown',
      Math.max(0, Math.floor(durationMs)),
      new Date().toISOString()
    );
  }

  function getState() {
    const solutions = {};
    for (const row of database.prepare('SELECT problem_id, language, code FROM solutions').all()) {
      solutions[`${row.problem_id}:${row.language}`] = row.code;
    }

    const progress = {};
    for (const row of database.prepare(`
      SELECT problem_id, status, seconds, last_passed_at, notes, updated_at FROM progress
    `).all()) {
      progress[row.problem_id] = {
        status: row.status,
        seconds: row.seconds,
        lastPassedAt: row.last_passed_at,
        notes: row.notes,
        updatedAt: row.updated_at
      };
    }

    const recentAttempts = database.prepare(`
      SELECT id, problem_id, language, mode, passed, passed_count, total_count, stage, duration_ms, created_at
      FROM attempts ORDER BY id DESC LIMIT 100
    `).all().map((row) => ({
      id: row.id,
      problemId: row.problem_id,
      language: row.language,
      mode: row.mode,
      passed: Boolean(row.passed),
      passedCount: row.passed_count,
      totalCount: row.total_count,
      stage: row.stage,
      durationMs: row.duration_ms,
      createdAt: row.created_at
    }));

    return { solutions, progress, recentAttempts };
  }

  function importState({ solutions = {}, progress = {} }) {
    database.exec('BEGIN IMMEDIATE');
    try {
      for (const [key, code] of Object.entries(solutions)) {
        const separator = key.lastIndexOf(':');
        if (separator <= 0 || typeof code !== 'string') continue;
        saveSolution({ problemId: key.slice(0, separator), language: key.slice(separator + 1), code });
      }
      for (const [problemId, value] of Object.entries(progress)) {
        if (!value || typeof value !== 'object') continue;
        saveProgress({ problemId, ...value });
      }
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
    return getState();
  }

  return {
    path: databasePath,
    close: () => database.close(),
    getState,
    importState,
    recordAttempt,
    saveProgress,
    saveSolution
  };
}

export const store = createStore(process.env.LOCALCODE_DB_PATH || defaultDatabasePath);
