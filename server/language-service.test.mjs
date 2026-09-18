import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'localcode-lsp-'));
process.env.JDTLS_DATA_DIR = path.join(temporaryDirectory, 'java-data');

const languageService = await import('./language-service.mjs');

test.after(async () => {
  await languageService.closeLanguageServices();
  await fs.rm(temporaryDirectory, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100
  });
});

test('Pyright provides semantic completion and diagnostics', async () => {
  const items = await languageService.getCompletions({
    language: 'python',
    code: 'from collections import deque\nqueue = deque()\nqueue.',
    position: { line: 2, character: 6 },
    triggerCharacter: '.'
  });
  assert.ok(items.some((item) => item.label === 'append'));

  const diagnostics = await languageService.getDiagnostics({
    language: 'python',
    code: 'class Solution:\n    def answer(self) -> int:\n        return "wrong"\n'
  });
  assert.ok(diagnostics.some((item) => /not assignable to return type/.test(item.message)));

  const implicitEnvironmentDiagnostics = await languageService.getDiagnostics({
    language: 'python',
    code: 'class Solution:\n    def test(self, root: TreeNode | None):\n        queue = deque([root])\n        return queue.popleft()\n'
  });
  assert.deepEqual(implicitEnvironmentDiagnostics, []);
});

test('JDT LS provides completion, imports, signatures, and diagnostics', {
  skip: !languageService.languageServiceStatus().java.available
}, async () => {
  const code = 'class Solution {\n  void test() {\n    HashM\n  }\n}\n';
  const items = await languageService.getCompletions({
    language: 'java',
    code,
    position: { line: 2, character: 9 }
  });
  const hashMap = items.find((item) => String(item.label).startsWith('HashMap'));
  assert.ok(hashMap);

  const importItems = await languageService.getCompletions({
    language: 'java',
    code: 'class Solution {\n  BigInt\n}\n',
    position: { line: 1, character: 8 }
  });
  const bigInteger = importItems.find((item) => String(item.label).startsWith('BigInteger'));
  assert.ok(bigInteger);
  const resolved = await languageService.resolveCompletion({ language: 'java', item: bigInteger });
  assert.ok(resolved.additionalTextEdits?.some((edit) => edit.newText.includes('java.math.BigInteger')));

  const signature = await languageService.getSignatureHelp({
    language: 'java',
    code: 'import java.util.*;\nclass Solution {\n  void test() {\n    Map<Integer,Integer> map = new HashMap<>();\n    map.put(\n  }\n}\n',
    position: { line: 4, character: 12 },
    triggerCharacter: '('
  });
  assert.match(signature.signatures[0].label, /put\(Integer key, Integer value\)/);

  const diagnostics = await languageService.getDiagnostics({
    language: 'java',
    code: 'class Solution {\n  int test() {\n    int value = "wrong";\n    return value;\n  }\n}\n'
  });
  assert.ok(diagnostics.some((item) => /cannot convert from String to int/.test(item.message)));

  const implicitEnvironmentDiagnostics = await languageService.getDiagnostics({
    language: 'java',
    code: 'class Solution {\n  Map<Integer, Integer> map = new HashMap<>();\n  ListNode head;\n  TreeNode root;\n}\n'
  });
  assert.deepEqual(implicitEnvironmentDiagnostics, []);
});
