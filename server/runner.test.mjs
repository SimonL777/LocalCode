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

test('accepts three-sum answers in a different valid order', async () => {
  const result = await runSubmission({
    problemId: '15',
    language: 'javascript',
    mode: 'submit',
    code: `class Solution {
      threeSum(nums) {
        nums.sort((a, b) => a - b);
        const result = [];
        for (let i = 0; i < nums.length - 2; i++) {
          if (i > 0 && nums[i] === nums[i - 1]) continue;
          let left = i + 1;
          let right = nums.length - 1;
          while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum < 0) left++;
            else if (sum > 0) right--;
            else {
              result.unshift([nums[right], nums[left], nums[i]]);
              const low = nums[left];
              const high = nums[right];
              while (left < right && nums[left] === low) left++;
              while (left < right && nums[right] === high) right--;
            }
          }
        }
        return result;
      }
    }`
  });
  assert.equal(result.ok, true);
});

test('runs tree and class-operation fixtures', async () => {
  const [treeResult, cacheResult] = await Promise.all([
    runSubmission({
      problemId: '98',
      language: 'python',
      code: `class Solution:
        def isValidBST(self, root):
          def check(node, lower, upper):
            if node is None: return True
            return lower < node.val < upper and check(node.left, lower, node.val) and check(node.right, node.val, upper)
          return check(root, float('-inf'), float('inf'))`
    }),
    runSubmission({
      problemId: '146',
      language: 'javascript',
      code: `class LRUCache {
        constructor(capacity) { this.capacity = capacity; this.values = new Map(); }
        get(key) {
          if (!this.values.has(key)) return -1;
          const value = this.values.get(key);
          this.values.delete(key);
          this.values.set(key, value);
          return value;
        }
        put(key, value) {
          this.values.delete(key);
          this.values.set(key, value);
          if (this.values.size > this.capacity) this.values.delete(this.values.keys().next().value);
        }
      }`
    })
  ]);
  assert.equal(treeResult.ok, true);
  assert.equal(cacheResult.ok, true);
});
