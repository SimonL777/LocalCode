import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runnableSpecs } from './catalog.mjs';

const TIMEOUT_MS = 5000;

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: `${stderr}${error.message}`, timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

function jsValue(value) {
  return JSON.stringify(value);
}

function pythonValue(value) {
  if (value === null) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(pythonValue).join(', ')}]`;
  return String(value);
}

function javaValue(value, type) {
  if (type === 'String') return JSON.stringify(value);
  if (type === 'int' || type === 'boolean') return String(value);
  if (type === 'int[]') return `new int[]{${value.join(',')}}`;
  if (type === 'ListNode') return `buildList(new int[]{${value.join(',')}})`;
  throw new Error(`Unsupported Java argument type: ${type}`);
}

function buildJavascript(code, spec) {
  const tests = spec.tests.map((test, index) => {
    const args = test.args.map(jsValue).join(', ');
    const call = spec.argTypes.includes('ListNode')
      ? `serializeList(new Solution().${spec.method}(buildList(${args})))`
      : `new Solution().${spec.method}(${args})`;
    return `emit(${index}, ${call});`;
  }).join('\n');
  return `
class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
function buildList(values) {
  const dummy = new ListNode();
  let current = dummy;
  for (const value of values) { current.next = new ListNode(value); current = current.next; }
  return dummy.next;
}
function serializeList(head) {
  const values = [];
  while (head) { values.push(head.val); head = head.next; }
  return values;
}
function emit(index, value) { console.log('__RESULT__' + JSON.stringify({ index, value })); }
${code}
${tests}
`;
}

function buildPython(code, spec) {
  const tests = spec.tests.map((test, index) => {
    const args = test.args.map(pythonValue).join(', ');
    const call = spec.argTypes.includes('ListNode')
      ? `serialize_list(Solution().${spec.method}(build_list(${args})))`
      : `Solution().${spec.method}(${args})`;
    return `emit(${index}, ${call})`;
  }).join('\n');
  return `
from __future__ import annotations
import json
from typing import *
from collections import *
import heapq
import bisect

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(values):
    dummy = ListNode()
    current = dummy
    for value in values:
        current.next = ListNode(value)
        current = current.next
    return dummy.next

def serialize_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    return values

def emit(index, value):
    print('__RESULT__' + json.dumps({'index': index, 'value': value}, ensure_ascii=False))

${code}

${tests}
`;
}

function buildJava(code, spec) {
  const explicitImports = code.match(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm) ?? [];
  const sanitized = code
    .replace(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm, '')
    .replace(/public\s+class\s+Solution/, 'class Solution');
  const imports = [...new Set([
    'import java.util.*;',
    ...explicitImports.map((item) => item.trim())
  ])].join('\n');
  const tests = spec.tests.map((test, index) => {
    const args = test.args.map((value, argIndex) => javaValue(value, spec.argTypes[argIndex])).join(', ');
    const rawCall = `new Solution().${spec.method}(${args})`;
    const call = spec.returnType === 'ListNode' ? `serializeList(${rawCall})` : rawCall;
    return `emit(${index}, ${call});`;
  }).join('\n        ');
  return `
${imports}

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

${sanitized}

public class Main {
    static ListNode buildList(int[] values) {
        ListNode dummy = new ListNode();
        ListNode current = dummy;
        for (int value : values) { current.next = new ListNode(value); current = current.next; }
        return dummy.next;
    }

    static int[] serializeList(ListNode head) {
        List<Integer> values = new ArrayList<>();
        while (head != null) { values.add(head.val); head = head.next; }
        int[] result = new int[values.size()];
        for (int i = 0; i < values.size(); i++) result[i] = values.get(i);
        return result;
    }

    static String json(Object value) {
        if (value == null) return "null";
        if (value instanceof Boolean || value instanceof Number) return value.toString();
        if (value instanceof int[]) return Arrays.toString((int[]) value).replace(" ", "");
        return "\\\"" + value.toString().replace("\\\"", "\\\\\\\"") + "\\\"";
    }

    static void emit(int index, Object value) {
        System.out.println("__RESULT__{\\\"index\\\":" + index + ",\\\"value\\\":" + json(value) + "}");
    }

    public static void main(String[] args) {
        ${tests}
    }
}
`;
}

function parseResults(stdout, spec) {
  const actual = new Map();
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.startsWith('__RESULT__')) continue;
    const result = JSON.parse(line.slice('__RESULT__'.length));
    actual.set(result.index, result.value);
  }
  return spec.tests.map((test, index) => {
    const received = actual.get(index);
    return {
      index,
      passed: JSON.stringify(received) === JSON.stringify(test.expected),
      expected: test.expected,
      received
    };
  });
}

export async function runSubmission({ problemId, language, code, mode = 'debug' }) {
  const spec = runnableSpecs[String(problemId)];
  if (!spec) return { ok: false, stage: 'unsupported', message: '这道题的本地测试尚未接入。' };
  if (!['java', 'javascript', 'python'].includes(language)) {
    return { ok: false, stage: 'validation', message: '不支持的语言。' };
  }
  if (typeof code !== 'string' || code.length > 100_000) {
    return { ok: false, stage: 'validation', message: '代码为空或过长。' };
  }
  if (!['debug', 'submit'].includes(mode)) {
    return { ok: false, stage: 'validation', message: '不支持的测试模式。' };
  }

  const selectedTests = mode === 'submit'
    ? [...spec.debugTests, ...spec.submissionTests]
    : spec.debugTests;
  const executionSpec = { ...spec, tests: selectedTests };

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'localcode-'));
  try {
    let execution;
    if (language === 'javascript') {
      await fs.writeFile(path.join(workDir, 'main.mjs'), buildJavascript(code, executionSpec));
      execution = await runProcess(process.execPath, ['main.mjs'], { cwd: workDir });
    } else if (language === 'python') {
      await fs.writeFile(path.join(workDir, 'main.py'), buildPython(code, executionSpec));
      execution = await runProcess(process.env.PYTHON_BIN ?? 'python3', ['main.py'], { cwd: workDir });
    } else {
      await fs.writeFile(path.join(workDir, 'Main.java'), buildJava(code, executionSpec));
      const compilation = await runProcess(process.env.JAVAC_BIN ?? 'javac', ['-encoding', 'UTF-8', 'Main.java'], { cwd: workDir });
      if (compilation.code !== 0 || compilation.timedOut) {
        return {
          ok: false,
          stage: compilation.timedOut ? 'timeout' : 'compile',
          message: compilation.timedOut ? '编译超时。' : compilation.stderr || compilation.stdout
        };
      }
      execution = await runProcess(process.env.JAVA_BIN ?? 'java', ['-cp', workDir, 'Main'], { cwd: workDir });
    }

    if (execution.timedOut) return { ok: false, stage: 'timeout', message: '运行超过 5 秒，已终止。' };
    if (execution.code !== 0) return { ok: false, stage: 'runtime', message: execution.stderr || execution.stdout };
    const tests = parseResults(execution.stdout, executionSpec).map((test, index) => ({
      ...test,
      name: selectedTests[index].name,
      hidden: mode === 'submit' && index >= spec.debugTests.length,
      expected: mode === 'submit' && index >= spec.debugTests.length ? undefined : test.expected,
      received: mode === 'submit' && index >= spec.debugTests.length ? undefined : test.received
    }));
    return {
      ok: tests.every((test) => test.passed),
      stage: 'test',
      mode,
      passedCount: tests.filter((test) => test.passed).length,
      totalCount: tests.length,
      tests,
      stdout: execution.stdout.split(/\r?\n/).filter((line) => line && !line.startsWith('__RESULT__')).join('\n')
    };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
