import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { javascriptStarters, references, runnableSpecs } from './catalog.mjs';
import { runSubmission } from './runner.mjs';

const execFileAsync = promisify(execFile);

const javaHelpers = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`;

const pythonHelpers = `from __future__ import annotations
from typing import *
from collections import *
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

`;

function standaloneJava(code) {
  const explicitImports = code.match(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm) ?? [];
  const sanitized = code
    .replace(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm, '')
    .replace(/public\s+class\s+Solution/, 'class Solution');
  const imports = [...new Set(['import java.util.*;', ...explicitImports.map((item) => item.trim())])];
  return `${imports.join('\n')}\n${javaHelpers}\n${sanitized}\nclass Main {}`;
}

test('every practice problem has a complete reference answer', () => {
  const problemIds = Object.keys(javascriptStarters).sort((a, b) => Number(a) - Number(b));
  const referenceIds = Object.keys(references).sort((a, b) => Number(a) - Number(b));
  const runnableIds = Object.keys(runnableSpecs).sort((a, b) => Number(a) - Number(b));
  assert.deepEqual(referenceIds, problemIds);
  assert.deepEqual(runnableIds, problemIds);

  for (const problemId of problemIds) {
    const reference = references[problemId];
    assert.ok(reference.hints.length >= 2, `problem ${problemId} needs at least two hints`);
    for (const field of ['complexity', 'java', 'javascript', 'python']) {
      assert.ok(reference[field]?.trim(), `problem ${problemId} is missing ${field}`);
    }
  }
});

test('all JavaScript references parse', () => {
  for (const [problemId, reference] of Object.entries(references)) {
    assert.doesNotThrow(
      () => new Function(reference.javascript),
      `problem ${problemId} has invalid JavaScript`
    );
  }
});

test('all Python references compile', async () => {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'localcode-python-references-'));
  try {
    for (const [problemId, reference] of Object.entries(references)) {
      const sourcePath = path.join(workDir, `problem_${problemId}.py`);
      await fs.writeFile(sourcePath, `${pythonHelpers}${reference.python}\n`);
      await execFileAsync(process.env.PYTHON_BIN ?? 'python3', ['-m', 'py_compile', sourcePath]);
    }
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
});

test('all Java references compile', async () => {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'localcode-java-references-'));
  try {
    for (const [problemId, reference] of Object.entries(references)) {
      const sourcePath = path.join(workDir, 'Main.java');
      await fs.writeFile(sourcePath, standaloneJava(reference.java));
      try {
        await execFileAsync(process.env.JAVAC_BIN ?? 'javac', ['-encoding', 'UTF-8', sourcePath], {
          cwd: workDir
        });
      } catch (error) {
        assert.fail(`problem ${problemId} has invalid Java:\n${error.stderr || error.stdout || error.message}`);
      }
      for (const file of await fs.readdir(workDir)) {
        if (file.endsWith('.class')) await fs.rm(path.join(workDir, file));
      }
    }
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
});

test('runnable reference answers pass every submission test', async () => {
  const checks = [];
  for (const problemId of Object.keys(runnableSpecs)) {
    for (const language of ['java', 'javascript', 'python']) {
      checks.push((async () => {
        const result = await runSubmission({
          problemId,
          language,
          code: references[problemId][language],
          mode: 'submit'
        });
        assert.equal(
          result.ok,
          true,
          `problem ${problemId} ${language} failed: ${result.message ?? JSON.stringify(result.tests)}`
        );
      })());
    }
  }
  await Promise.all(checks);
});
