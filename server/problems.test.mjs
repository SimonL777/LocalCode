import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadProblems } from './problems.mjs';

test('loads a usable problem catalog', async () => {
  const previousStudyDir = process.env.LOCALCODE_STUDY_DIR;
  let problems;
  try {
    process.env.LOCALCODE_STUDY_DIR = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../data/demo'
    );
    problems = await loadProblems();
  } finally {
    if (previousStudyDir === undefined) delete process.env.LOCALCODE_STUDY_DIR;
    else process.env.LOCALCODE_STUDY_DIR = previousStudyDir;
  }
  assert.ok(problems.length >= 5);
  assert.ok(problems.some((problem) => problem.id === '3'));
  assert.ok(problems.some((problem) => problem.id === '20'));
  assert.ok(problems.every((problem) => problem.starters.java !== undefined));
});
