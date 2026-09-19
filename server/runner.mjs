import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runnableSpecs } from './catalog.mjs';

const EXECUTION_TIMEOUT_MS = 5000;
const COMPILATION_TIMEOUT_MS = 15000;

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
    }, options.timeoutMs ?? EXECUTION_TIMEOUT_MS);

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
  if (type === 'String[]') return `new String[]{${value.map(JSON.stringify).join(',')}}`;
  if (type === 'int[][]') {
    return `new int[][]{${value.map((row) => `{${row.join(',')}}`).join(',')}}`;
  }
  if (type === 'char[][]') {
    return `new char[][]{${value.map((row) => `{${row.map((item) => `'${item}'`).join(',')}}`).join(',')}}`;
  }
  if (type === 'ListNode') return `buildList(new int[]{${value.join(',')}})`;
  if (type === 'CyclicListNode') {
    return `buildCyclicList(new int[]{${value.values.join(',')}}, ${value.pos})`;
  }
  if (type === 'TreeNode') return `buildTree(${javaIntegerArray(value)})`;
  throw new Error(`Unsupported Java argument type: ${type}`);
}

function javaIntegerArray(values) {
  return `new Integer[]{${values.map((value) => value === null ? 'null' : value).join(',')}}`;
}

function javascriptValue(value, type) {
  if (type === 'ListNode') return `buildList(${JSON.stringify(value)})`;
  if (type === 'CyclicListNode') {
    return `buildCyclicList(${JSON.stringify(value.values)}, ${value.pos})`;
  }
  if (type === 'TreeNode') return `buildTree(${JSON.stringify(value)})`;
  return JSON.stringify(value);
}

function pythonArgument(value, type) {
  if (type === 'ListNode') return `build_list(${pythonValue(value)})`;
  if (type === 'CyclicListNode') {
    return `build_cyclic_list(${pythonValue(value.values)}, ${value.pos})`;
  }
  if (type === 'TreeNode') return `build_tree(${pythonValue(value)})`;
  return pythonValue(value);
}

function javascriptTest(test, index, spec) {
  if (spec.fixture === 'classOperations') {
    const [operations, args] = test.args;
    const lines = [
      `{`,
      `  const instance = new ${spec.className}(${args[0].map(JSON.stringify).join(', ')});`,
      '  const output = [null];'
    ];
    for (let operationIndex = 1; operationIndex < operations.length; operationIndex++) {
      const invocation = `instance.${operations[operationIndex]}(${args[operationIndex].map(JSON.stringify).join(', ')})`;
      lines.push(operations[operationIndex] === 'put'
        ? `  ${invocation}; output.push(null);`
        : `  output.push(${invocation});`);
    }
    lines.push(`  emit(${index}, output);`, `}`);
    return lines.join('\n');
  }
  if (spec.fixture === 'treeTargets') {
    const [values, first, second] = test.args;
    return `{
  const root = buildTree(${JSON.stringify(values)});
  const result = new Solution().${spec.method}(root, findTreeNode(root, ${first}), findTreeNode(root, ${second}));
  emit(${index}, result === null ? null : result.val);
}`;
  }
  const args = test.args.map((value, argIndex) => javascriptValue(value, spec.argTypes[argIndex])).join(', ');
  const rawCall = `new Solution().${spec.method}(${args})`;
  const call = spec.returnType === 'ListNode' ? `serializeList(${rawCall})` : rawCall;
  return `emit(${index}, ${call});`;
}

function buildJavascript(code, spec) {
  const tests = spec.tests.map((test, index) => javascriptTest(test, index, spec)).join('\n');
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
function buildCyclicList(values, pos) {
  if (values.length === 0) return null;
  const nodes = values.map((value) => new ListNode(value));
  for (let i = 1; i < nodes.length; i++) nodes[i - 1].next = nodes[i];
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  return nodes[0];
}
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
function buildTree(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let head = 0;
  let index = 1;
  while (head < queue.length && index < values.length) {
    const node = queue[head++];
    if (index < values.length && values[index] !== null) {
      node.left = new TreeNode(values[index]);
      queue.push(node.left);
    }
    index++;
    if (index < values.length && values[index] !== null) {
      node.right = new TreeNode(values[index]);
      queue.push(node.right);
    }
    index++;
  }
  return root;
}
function findTreeNode(root, value) {
  if (root === null) return null;
  const queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node.val === value) return node;
    if (node.left !== null) queue.push(node.left);
    if (node.right !== null) queue.push(node.right);
  }
  return null;
}
function emit(index, value) { console.log('__RESULT__' + JSON.stringify({ index, value })); }
${code}
${tests}
`;
}

function pythonTest(test, index, spec) {
  if (spec.fixture === 'classOperations') {
    const [operations, args] = test.args;
    const lines = [
      `instance = ${spec.className}(${args[0].map(pythonValue).join(', ')})`,
      'output = [None]'
    ];
    for (let operationIndex = 1; operationIndex < operations.length; operationIndex++) {
      const invocation = `instance.${operations[operationIndex]}(${args[operationIndex].map(pythonValue).join(', ')})`;
      lines.push(operations[operationIndex] === 'put'
        ? `${invocation}\noutput.append(None)`
        : `output.append(${invocation})`);
    }
    lines.push(`emit(${index}, output)`);
    return lines.join('\n');
  }
  if (spec.fixture === 'treeTargets') {
    const [values, first, second] = test.args;
    return `root = build_tree(${pythonValue(values)})
result = Solution().${spec.method}(root, find_tree_node(root, ${first}), find_tree_node(root, ${second}))
emit(${index}, None if result is None else result.val)`;
  }
  const args = test.args.map((value, argIndex) => pythonArgument(value, spec.argTypes[argIndex])).join(', ');
  const rawCall = `Solution().${spec.method}(${args})`;
  const call = spec.returnType === 'ListNode' ? `serialize_list(${rawCall})` : rawCall;
  return `emit(${index}, ${call})`;
}

function buildPython(code, spec) {
  const tests = spec.tests.map((test, index) => pythonTest(test, index, spec)).join('\n');
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

def build_cyclic_list(values, pos):
    if not values:
        return None
    nodes = [ListNode(value) for value in values]
    for index in range(1, len(nodes)):
        nodes[index - 1].next = nodes[index]
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        node = queue.popleft()
        if index < len(values) and values[index] is not None:
            node.left = TreeNode(values[index])
            queue.append(node.left)
        index += 1
        if index < len(values) and values[index] is not None:
            node.right = TreeNode(values[index])
            queue.append(node.right)
        index += 1
    return root

def find_tree_node(root, value):
    if root is None:
        return None
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node.val == value:
            return node
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return None

def emit(index, value):
    print('__RESULT__' + json.dumps({'index': index, 'value': value}, ensure_ascii=False))

${code}

${tests}
`;
}

function javaTest(test, index, spec) {
  if (spec.fixture === 'classOperations') {
    const [operations, args] = test.args;
    const variable = `cache${index}`;
    const output = `output${index}`;
    const lines = [
      `${spec.className} ${variable} = new ${spec.className}(${args[0].join(', ')});`,
      `List<Object> ${output} = new ArrayList<>();`,
      `${output}.add(null);`
    ];
    for (let operationIndex = 1; operationIndex < operations.length; operationIndex++) {
      const invocation = `${variable}.${operations[operationIndex]}(${args[operationIndex].join(', ')})`;
      lines.push(operations[operationIndex] === 'put'
        ? `${invocation}; ${output}.add(null);`
        : `${output}.add(${invocation});`);
    }
    lines.push(`emit(${index}, ${output});`);
    return lines.join('\n        ');
  }
  if (spec.fixture === 'treeTargets') {
    const [values, first, second] = test.args;
    return `TreeNode root${index} = buildTree(${javaIntegerArray(values)});
        TreeNode result${index} = new Solution().${spec.method}(root${index}, findTreeNode(root${index}, ${first}), findTreeNode(root${index}, ${second}));
        emit(${index}, result${index} == null ? null : result${index}.val);`;
  }
  const args = test.args.map((value, argIndex) => javaValue(value, spec.argTypes[argIndex])).join(', ');
  const rawCall = `new Solution().${spec.method}(${args})`;
  const call = spec.returnType === 'ListNode' ? `serializeList(${rawCall})` : rawCall;
  return `emit(${index}, ${call});`;
}

function buildJava(code, spec) {
  const explicitImports = code.match(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm) ?? [];
  const sanitized = code
    .replace(/^\s*import\s+(?:static\s+)?[^;]+;\s*$/gm, '')
    .replace(/public\s+class\s+(Solution|LRUCache)/, 'class $1');
  const imports = [...new Set([
    'import java.util.*;',
    ...explicitImports.map((item) => item.trim())
  ])].join('\n');
  const tests = spec.tests.map((test, index) => javaTest(test, index, spec)).join('\n        ');
  return `
${imports}

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

    static ListNode buildCyclicList(int[] values, int pos) {
        if (values.length == 0) return null;
        ListNode[] nodes = new ListNode[values.length];
        for (int i = 0; i < values.length; i++) nodes[i] = new ListNode(values[i]);
        for (int i = 1; i < nodes.length; i++) nodes[i - 1].next = nodes[i];
        if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
        return nodes[0];
    }

    static TreeNode buildTree(Integer[] values) {
        if (values.length == 0 || values[0] == null) return null;
        TreeNode root = new TreeNode(values[0]);
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        int index = 1;
        while (!queue.isEmpty() && index < values.length) {
            TreeNode node = queue.poll();
            if (index < values.length && values[index] != null) {
                node.left = new TreeNode(values[index]);
                queue.offer(node.left);
            }
            index++;
            if (index < values.length && values[index] != null) {
                node.right = new TreeNode(values[index]);
                queue.offer(node.right);
            }
            index++;
        }
        return root;
    }

    static TreeNode findTreeNode(TreeNode root, int value) {
        if (root == null) return null;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node.val == value) return node;
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        return null;
    }

    static String json(Object value) {
        if (value == null) return "null";
        if (value instanceof Boolean || value instanceof Number) return value.toString();
        if (value instanceof String || value instanceof Character) {
            return "\\\"" + value.toString()
                .replace("\\\\", "\\\\\\\\")
                .replace("\\\"", "\\\\\\\"")
                .replace("\\n", "\\\\n") + "\\\"";
        }
        if (value.getClass().isArray()) {
            StringBuilder result = new StringBuilder("[");
            int length = java.lang.reflect.Array.getLength(value);
            for (int i = 0; i < length; i++) {
                if (i > 0) result.append(',');
                result.append(json(java.lang.reflect.Array.get(value, i)));
            }
            return result.append(']').toString();
        }
        if (value instanceof Iterable<?>) {
            StringBuilder result = new StringBuilder("[");
            boolean first = true;
            for (Object item : (Iterable<?>) value) {
                if (!first) result.append(',');
                result.append(json(item));
                first = false;
            }
            return result.append(']').toString();
        }
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

function sortByJson(values) {
  return [...values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function canonicalize(value, comparison) {
  if (!Array.isArray(value)) return value;
  if (comparison === 'unordered') return sortByJson(value);
  if (comparison === 'outerUnordered') return sortByJson(value.map((item) => Array.isArray(item) ? [...item] : item));
  if (comparison === 'nestedUnordered') {
    return sortByJson(value.map((item) => Array.isArray(item) ? sortByJson(item) : item));
  }
  return value;
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
    const normalizedReceived = canonicalize(received, spec.comparison);
    const normalizedExpected = canonicalize(test.expected, spec.comparison);
    return {
      index,
      passed: JSON.stringify(normalizedReceived) === JSON.stringify(normalizedExpected),
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
      const compilation = await runProcess(process.env.JAVAC_BIN ?? 'javac', ['-encoding', 'UTF-8', 'Main.java'], {
        cwd: workDir,
        timeoutMs: COMPILATION_TIMEOUT_MS
      });
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
