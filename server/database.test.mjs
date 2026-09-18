import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from './database.mjs';

test('persists solutions, progress, and attempts in SQLite', () => {
  const database = createStore(':memory:');
  try {
    database.saveSolution({ problemId: '704', language: 'java', code: 'class Solution {}' });
    database.saveProgress({ problemId: '704', status: 'passed', seconds: 123, lastPassedAt: '2026-09-18T00:00:00.000Z' });
    database.recordAttempt({
      problemId: '704',
      language: 'java',
      mode: 'submit',
      result: { ok: true, stage: 'test', passedCount: 11, totalCount: 11 },
      durationMs: 42
    });

    const state = database.getState();
    assert.equal(state.solutions['704:java'], 'class Solution {}');
    assert.equal(state.progress['704'].status, 'passed');
    assert.equal(state.progress['704'].seconds, 123);
    assert.equal(state.recentAttempts[0].passed, true);
    assert.equal(state.recentAttempts[0].totalCount, 11);
  } finally {
    database.close();
  }
});

test('imports legacy browser state without overwriting the schema', () => {
  const database = createStore(':memory:');
  try {
    const state = database.importState({
      solutions: { '1:python': 'class Solution: pass' },
      progress: { '1': { status: 'passed', seconds: 9 } }
    });
    assert.equal(state.solutions['1:python'], 'class Solution: pass');
    assert.equal(state.progress['1'].seconds, 9);
  } finally {
    database.close();
  }
});
