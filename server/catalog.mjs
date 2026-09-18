export const runnableSpecs = {
  '1': {
    method: 'twoSum',
    argTypes: ['int[]', 'int'],
    returnType: 'int[]',
    debugTests: [
      { name: '官方样例 1', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { name: '补数位于后方', args: [[3, 2, 4], 6], expected: [1, 2] },
      { name: '重复元素', args: [[3, 3], 6], expected: [0, 1] }
    ],
    submissionTests: [
      { name: '负数补数', args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      { name: '双零', args: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { name: '全负数', args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
      { name: '相同大数', args: [[2, 5, 5, 11], 10], expected: [1, 2] },
      { name: '整数边界', args: [[1000000000, -1000000000, 7], 0], expected: [0, 1] },
      { name: '答案位于首尾', args: [[8, 1, 2, 3, 12], 20], expected: [0, 4] },
      { name: '零与负数', args: [[4, -2, 0, 9], -2], expected: [1, 2] }
    ]
  },
  '3': {
    method: 'lengthOfLongestSubstring',
    argTypes: ['String'],
    returnType: 'int',
    debugTests: [
      { name: '重复窗口', args: ['abcabcbb'], expected: 3 },
      { name: '全相同字符', args: ['bbbbb'], expected: 1 },
      { name: '窗口左端跳跃', args: ['pwwkew'], expected: 3 }
    ],
    submissionTests: [
      { name: '空字符串', args: [''], expected: 0 },
      { name: '单字符', args: ['a'], expected: 1 },
      { name: '空格字符', args: [' '], expected: 1 },
      { name: '重复字符不在当前窗口', args: ['abba'], expected: 2 },
      { name: '中段重复', args: ['dvdf'], expected: 3 },
      { name: '窗口连续移动', args: ['tmmzuxt'], expected: 5 },
      { name: '尾部形成最长窗口', args: ['anviaj'], expected: 5 },
      { name: '数字与符号', args: ['a1!a2@'], expected: 5 }
    ]
  },
  '20': {
    method: 'isValid',
    argTypes: ['String'],
    returnType: 'boolean',
    debugTests: [
      { name: '单组括号', args: ['()'], expected: true },
      { name: '连续括号', args: ['()[]{}'], expected: true },
      { name: '类型不匹配', args: ['(]'], expected: false }
    ],
    submissionTests: [
      { name: '交叉嵌套', args: ['([)]'], expected: false },
      { name: '正确嵌套', args: ['{[]}'], expected: true },
      { name: '右括号开头', args: [']'], expected: false },
      { name: '多层嵌套', args: ['((()))'], expected: true },
      { name: '多余右括号', args: ['(){}}{'], expected: false },
      { name: '缺少右括号', args: ['((('], expected: false },
      { name: '复杂合法组合', args: ['{[()()]}'], expected: true }
    ]
  },
  '206': {
    method: 'reverseList',
    argTypes: ['ListNode'],
    returnType: 'ListNode',
    debugTests: [
      { name: '五节点链表', args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { name: '双节点链表', args: [[1, 2]], expected: [2, 1] },
      { name: '空链表', args: [[]], expected: [] }
    ],
    submissionTests: [
      { name: '单节点链表', args: [[1]], expected: [1] },
      { name: '含负数', args: [[-3, 0, 4]], expected: [4, 0, -3] },
      { name: '含重复值', args: [[2, 2, 3, 3]], expected: [3, 3, 2, 2] },
      { name: '较长链表', args: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: [8, 7, 6, 5, 4, 3, 2, 1] }
    ]
  },
  '704': {
    method: 'search',
    argTypes: ['int[]', 'int'],
    returnType: 'int',
    debugTests: [
      { name: '命中中后段', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { name: '目标不存在', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { name: '单元素命中', args: [[5], 5], expected: 0 }
    ],
    submissionTests: [
      { name: '命中首元素', args: [[-10, -3, 0, 4, 8], -10], expected: 0 },
      { name: '命中尾元素', args: [[-10, -3, 0, 4, 8], 8], expected: 4 },
      { name: '单元素未命中', args: [[5], -5], expected: -1 },
      { name: '双元素左侧', args: [[1, 9], 1], expected: 0 },
      { name: '双元素右侧', args: [[1, 9], 9], expected: 1 },
      { name: '偶数长度中间值', args: [[1, 3, 5, 7, 9, 11], 5], expected: 2 },
      { name: '全负数', args: [[-9, -7, -5, -3, -1], -3], expected: 3 },
      { name: '大数组边界', args: [[-9999, -10, 0, 42, 9999], 9999], expected: 4 }
    ]
  }
};

export const javascriptStarters = {
  '1': `class Solution {\n  /** @param {number[]} nums @param {number} target @return {number[]} */\n  twoSum(nums, target) {\n    \n  }\n}`,
  '3': `class Solution {\n  /** @param {string} s @return {number} */\n  lengthOfLongestSubstring(s) {\n    \n  }\n}`,
  '15': `class Solution {\n  /** @param {number[]} nums @return {number[][]} */\n  threeSum(nums) {\n    \n  }\n}`,
  '20': `class Solution {\n  /** @param {string} s @return {boolean} */\n  isValid(s) {\n    \n  }\n}`,
  '33': `class Solution {\n  search(nums, target) {\n    \n  }\n}`,
  '46': `class Solution {\n  permute(nums) {\n    \n  }\n}`,
  '49': `class Solution {\n  groupAnagrams(strs) {\n    \n  }\n}`,
  '53': `class Solution {\n  maxSubArray(nums) {\n    \n  }\n}`,
  '56': `class Solution {\n  merge(intervals) {\n    \n  }\n}`,
  '98': `class Solution {\n  isValidBST(root) {\n    \n  }\n}`,
  '102': `class Solution {\n  levelOrder(root) {\n    \n  }\n}`,
  '141': `class Solution {\n  hasCycle(head) {\n    \n  }\n}`,
  '146': `class LRUCache {\n  constructor(capacity) {\n    \n  }\n\n  get(key) {\n    \n  }\n\n  put(key, value) {\n    \n  }\n}`,
  '198': `class Solution {\n  rob(nums) {\n    \n  }\n}`,
  '200': `class Solution {\n  numIslands(grid) {\n    \n  }\n}`,
  '206': `class Solution {\n  reverseList(head) {\n    \n  }\n}`,
  '207': `class Solution {\n  canFinish(numCourses, prerequisites) {\n    \n  }\n}`,
  '215': `class Solution {\n  findKthLargest(nums, k) {\n    \n  }\n}`,
  '236': `class Solution {\n  lowestCommonAncestor(root, p, q) {\n    \n  }\n}`,
  '322': `class Solution {\n  coinChange(coins, amount) {\n    \n  }\n}`,
  '347': `class Solution {\n  topKFrequent(nums, k) {\n    \n  }\n}`,
  '560': `class Solution {\n  subarraySum(nums, k) {\n    \n  }\n}`,
  '704': `class Solution {\n  search(nums, target) {\n    \n  }\n}`,
  '739': `class Solution {\n  dailyTemperatures(temperatures) {\n    \n  }\n}`
};

export const references = {
  '1': {
    hints: [
      '遍历到 nums[i] 时，只需要知道 target - nums[i] 是否在前面出现过。',
      '哈希表保存“数值 -> 下标”。先查补数，再写入当前值，可避免重复使用同一元素。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> indices = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (indices.containsKey(complement)) {\n                return new int[]{indices.get(complement), i};\n            }\n            indices.put(nums[i], i);\n        }\n        throw new IllegalStateException("No solution");\n    }\n}`,
    javascript: `class Solution {\n  twoSum(nums, target) {\n    const indices = new Map();\n    for (let i = 0; i < nums.length; i++) {\n      const complement = target - nums[i];\n      if (indices.has(complement)) {\n        return [indices.get(complement), i];\n      }\n      indices.set(nums[i], i);\n    }\n    throw new Error('No solution');\n  }\n}`,
    python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        indices = {}\n        for i, value in enumerate(nums):\n            complement = target - value\n            if complement in indices:\n                return [indices[complement], i]\n            indices[value] = i\n        raise RuntimeError("No solution")`
  }
};
