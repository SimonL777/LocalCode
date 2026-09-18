import test from 'node:test';
import assert from 'node:assert/strict';
import { runSubmission } from './runner.mjs';

test('runs a JavaScript two-sum solution', async () => {
  const result = await runSubmission({
    problemId: '1',
    language: 'javascript',
    code: `class Solution { twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i++) { const need = target - nums[i]; if (seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i); } } }`
  });
  assert.equal(result.ok, true);
});

test('reports failed test cases', async () => {
  const result = await runSubmission({
    problemId: '704',
    language: 'python',
    code: 'class Solution:\n    def search(self, nums, target):\n        return -1'
  });
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'test');
});

test('compiles and runs a Java two-sum solution', async () => {
  const result = await runSubmission({
    problemId: '1',
    language: 'java',
    code: `class Solution {
      public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
          int need = target - nums[i];
          if (seen.containsKey(need)) return new int[]{seen.get(need), i};
          seen.put(nums[i], i);
        }
        throw new RuntimeException();
      }
    }`
  });
  assert.equal(result.ok, true);
});

test('keeps explicit Java imports before the judge wrapper classes', async () => {
  const result = await runSubmission({
    problemId: '1',
    language: 'java',
    code: `import java.math.BigInteger;
      class Solution {
        public int[] twoSum(int[] nums, int target) {
          BigInteger.valueOf(target);
          Map<Integer, Integer> seen = new HashMap<>();
          for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
          }
          throw new RuntimeException();
        }
      }`
  });
  assert.equal(result.ok, true);
});

test('adapts linked-list inputs and outputs for Python', async () => {
  const result = await runSubmission({
    problemId: '206',
    language: 'python',
    code: `class Solution:
      def reverseList(self, head):
        previous = None
        while head:
          next_node = head.next
          head.next = previous
          previous = head
          head = next_node
        return previous`
  });
  assert.equal(result.ok, true);
});

test('submission mode runs the full hidden suite', async () => {
  const result = await runSubmission({
    problemId: '1',
    language: 'javascript',
    mode: 'submit',
    code: `class Solution { twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i++) { const need = target - nums[i]; if (seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i); } } }`
  });
  assert.equal(result.ok, true);
  assert.equal(result.totalCount, 10);
  assert.equal(result.passedCount, 10);
  assert.equal(result.tests.filter((item) => item.hidden).length, 7);
  assert.equal(result.tests.at(-1).expected, undefined);
});

test('reports the Java Math.floor lossy conversion error', async () => {
  const result = await runSubmission({
    problemId: '704',
    language: 'java',
    code: `class Solution {
      public int search(int[] nums, int target) {
        int start = 0;
        int end = nums.length - 1;
        int middle = Math.floor((start + end) / 2);
        return middle;
      }
    }`
  });
  assert.equal(result.ok, false);
  assert.equal(result.stage, 'compile');
  assert.match(result.message, /lossy conversion from double to int/);
});
