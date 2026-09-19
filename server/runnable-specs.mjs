export const runnableSpecs = {
  '1': {
    method: 'twoSum',
    argTypes: ['int[]', 'int'],
    returnType: 'int[]',
    comparison: 'unordered',
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
  '15': {
    method: 'threeSum',
    argTypes: ['int[]'],
    returnType: 'nested',
    comparison: 'nestedUnordered',
    debugTests: [
      { name: '官方样例', args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
      { name: '无解', args: [[0, 1, 1]], expected: [] },
      { name: '三个零', args: [[0, 0, 0]], expected: [[0, 0, 0]] }
    ],
    submissionTests: [
      { name: '重复零去重', args: [[0, 0, 0, 0]], expected: [[0, 0, 0]] },
      { name: '重复元素组合', args: [[-2, 0, 1, 1, 2]], expected: [[-2, 0, 2], [-2, 1, 1]] },
      { name: '两个不同答案', args: [[-1, 0, 1, 0]], expected: [[-1, 0, 1]] },
      { name: '多个答案', args: [[-2, -1, 0, 1, 2, 3]], expected: [[-2, -1, 3], [-2, 0, 2], [-1, 0, 1]] },
      { name: '全为正数', args: [[1, 2, 3, 4]], expected: [] },
      { name: '全为负数', args: [[-4, -3, -2, -1]], expected: [] }
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
  '33': {
    method: 'search',
    argTypes: ['int[]', 'int'],
    returnType: 'int',
    debugTests: [
      { name: '旋转数组命中', args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { name: '旋转数组未命中', args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { name: '单元素未命中', args: [[1], 0], expected: -1 }
    ],
    submissionTests: [
      { name: '单元素命中', args: [[1], 1], expected: 0 },
      { name: '双元素旋转', args: [[3, 1], 1], expected: 1 },
      { name: '目标在左半段', args: [[6, 7, 8, 1, 2, 3, 4, 5], 7], expected: 1 },
      { name: '目标在右半段', args: [[6, 7, 8, 1, 2, 3, 4, 5], 4], expected: 6 },
      { name: '未旋转数组', args: [[1, 2, 3, 4, 5], 4], expected: 3 },
      { name: '旋转点目标', args: [[5, 1, 2, 3, 4], 1], expected: 1 }
    ]
  },
  '46': {
    method: 'permute',
    argTypes: ['int[]'],
    returnType: 'nested',
    comparison: 'outerUnordered',
    debugTests: [
      { name: '三个元素', args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { name: '两个元素', args: [[0, 1]], expected: [[0, 1], [1, 0]] },
      { name: '单元素', args: [[1]], expected: [[1]] }
    ],
    submissionTests: [
      { name: '包含负数', args: [[-1, 2]], expected: [[-1, 2], [2, -1]] },
      { name: '四元素全排列', args: [[1, 2, 3, 4]], expected: [
        [1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2],
        [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1],
        [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1],
        [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]
      ] },
      { name: '零和负数', args: [[0, -1, 1]], expected: [[0, -1, 1], [0, 1, -1], [-1, 0, 1], [-1, 1, 0], [1, 0, -1], [1, -1, 0]] }
    ]
  },
  '49': {
    method: 'groupAnagrams',
    argTypes: ['String[]'],
    returnType: 'nested',
    comparison: 'nestedUnordered',
    debugTests: [
      { name: '多组异位词', args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']] },
      { name: '空字符串', args: [['']], expected: [['']] },
      { name: '单字符串', args: [['a']], expected: [['a']] }
    ],
    submissionTests: [
      { name: '重复空字符串', args: [['', '']], expected: [['', '']] },
      { name: '重复输入', args: [['abc', 'bca', 'abc']], expected: [['abc', 'bca', 'abc']] },
      { name: '混合分组', args: [['abc', 'cab', 'foo', 'ofo', 'bar']], expected: [['abc', 'cab'], ['foo', 'ofo'], ['bar']] },
      { name: '无异位词', args: [['a', 'b', 'c']], expected: [['a'], ['b'], ['c']] },
      { name: '不同长度', args: [['ab', 'ba', 'abc', 'cba']], expected: [['ab', 'ba'], ['abc', 'cba']] }
    ]
  },
  '53': {
    method: 'maxSubArray',
    argTypes: ['int[]'],
    returnType: 'int',
    debugTests: [
      { name: '官方混合样例', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { name: '单元素', args: [[1]], expected: 1 },
      { name: '全正数', args: [[5, 4, -1, 7, 8]], expected: 23 }
    ],
    submissionTests: [
      { name: '全负数', args: [[-8, -3, -6, -2, -5, -4]], expected: -2 },
      { name: '零', args: [[0]], expected: 0 },
      { name: '前缀最优', args: [[4, -1, 2, -10, 1]], expected: 5 },
      { name: '后缀最优', args: [[-10, 1, 2, 3]], expected: 6 },
      { name: '交替正负', args: [[2, -1, 2, -1, 2]], expected: 4 }
    ]
  },
  '56': {
    method: 'merge',
    argTypes: ['int[][]'],
    returnType: 'nested',
    comparison: 'outerUnordered',
    debugTests: [
      { name: '多个重叠区间', args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { name: '端点相接', args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { name: '被包含区间', args: [[[1, 4], [2, 3]]], expected: [[1, 4]] }
    ],
    submissionTests: [
      { name: '单区间', args: [[[1, 2]]], expected: [[1, 2]] },
      { name: '无需合并', args: [[[1, 2], [3, 4], [5, 6]]], expected: [[1, 2], [3, 4], [5, 6]] },
      { name: '输入无序', args: [[[8, 10], [1, 3], [2, 6]]], expected: [[1, 6], [8, 10]] },
      { name: '连锁合并', args: [[[1, 4], [2, 5], [5, 8]]], expected: [[1, 8]] },
      { name: '相同区间', args: [[[1, 3], [1, 3], [1, 3]]], expected: [[1, 3]] }
    ]
  },
  '98': {
    method: 'isValidBST',
    argTypes: ['TreeNode'],
    returnType: 'boolean',
    debugTests: [
      { name: '合法二叉搜索树', args: [[2, 1, 3]], expected: true },
      { name: '跨子树违反约束', args: [[5, 1, 4, null, null, 3, 6]], expected: false },
      { name: '单节点', args: [[1]], expected: true }
    ],
    submissionTests: [
      { name: '左子树越界', args: [[5, 4, 6, null, null, 3, 7]], expected: false },
      { name: '重复值', args: [[2, 2, 2]], expected: false },
      { name: '整数下界', args: [[-2147483648]], expected: true },
      { name: '整数上界', args: [[2147483647]], expected: true },
      { name: '深层合法树', args: [[10, 5, 15, 2, 7, 12, 20]], expected: true },
      { name: '深层右节点越界', args: [[10, 5, 15, 2, 11, 12, 20]], expected: false }
    ]
  },
  '102': {
    method: 'levelOrder',
    argTypes: ['TreeNode'],
    returnType: 'nested',
    debugTests: [
      { name: '完整层序样例', args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
      { name: '单节点', args: [[1]], expected: [[1]] },
      { name: '空树', args: [[]], expected: [] }
    ],
    submissionTests: [
      { name: '仅左子树', args: [[1, 2, null, 3]], expected: [[1], [2], [3]] },
      { name: '仅右子树', args: [[1, null, 2, null, 3]], expected: [[1], [2], [3]] },
      { name: '不完全二叉树', args: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [2, 3], [4, 5]] },
      { name: '包含负数', args: [[0, -1, 1, -2, null, null, 2]], expected: [[0], [-1, 1], [-2, 2]] }
    ]
  },
  '141': {
    method: 'hasCycle',
    argTypes: ['CyclicListNode'],
    returnType: 'boolean',
    debugTests: [
      { name: '尾部连接第二个节点', args: [{ values: [3, 2, 0, -4], pos: 1 }], expected: true },
      { name: '双节点成环', args: [{ values: [1, 2], pos: 0 }], expected: true },
      { name: '单节点无环', args: [{ values: [1], pos: -1 }], expected: false }
    ],
    submissionTests: [
      { name: '空链表', args: [{ values: [], pos: -1 }], expected: false },
      { name: '单节点自环', args: [{ values: [1], pos: 0 }], expected: true },
      { name: '长链表无环', args: [{ values: [1, 2, 3, 4, 5, 6], pos: -1 }], expected: false },
      { name: '尾部连接头节点', args: [{ values: [1, 2, 3, 4], pos: 0 }], expected: true },
      { name: '尾部连接中间节点', args: [{ values: [-1, -2, -3, -4, -5], pos: 2 }], expected: true }
    ]
  },
  '146': {
    fixture: 'classOperations',
    className: 'LRUCache',
    debugTests: [
      {
        name: '官方操作序列',
        args: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4]
      },
      {
        name: '容量为一',
        args: [['LRUCache', 'put', 'get', 'put', 'get', 'get'], [[1], [1, 1], [1], [2, 2], [1], [2]]],
        expected: [null, null, 1, null, -1, 2]
      }
    ],
    submissionTests: [
      {
        name: '更新已有键',
        args: [['LRUCache', 'put', 'put', 'get'], [[2], [1, 1], [1, 9], [1]]],
        expected: [null, null, null, 9]
      },
      {
        name: 'get 更新最近使用顺序',
        args: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [1]]],
        expected: [null, null, null, 1, null, -1, 1]
      },
      {
        name: 'put 更新最近使用顺序',
        args: [['LRUCache', 'put', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 10], [3, 3], [1], [2]]],
        expected: [null, null, null, null, null, 10, -1]
      },
      {
        name: '容量三连续淘汰',
        args: [['LRUCache', 'put', 'put', 'put', 'put', 'get', 'get', 'get', 'get'], [[3], [1, 1], [2, 2], [3, 3], [4, 4], [1], [2], [3], [4]]],
        expected: [null, null, null, null, null, -1, 2, 3, 4]
      }
    ]
  },
  '198': {
    method: 'rob',
    argTypes: ['int[]'],
    returnType: 'int',
    debugTests: [
      { name: '间隔选择', args: [[1, 2, 3, 1]], expected: 4 },
      { name: '多个选择', args: [[2, 7, 9, 3, 1]], expected: 12 },
      { name: '单间房', args: [[5]], expected: 5 }
    ],
    submissionTests: [
      { name: '两间房', args: [[2, 1]], expected: 2 },
      { name: '全零', args: [[0, 0, 0]], expected: 0 },
      { name: '中间房最高', args: [[1, 10, 1]], expected: 10 },
      { name: '首尾组合', args: [[5, 1, 1, 5]], expected: 10 },
      { name: '连续权衡', args: [[2, 1, 4, 5, 3, 1, 1, 3]], expected: 12 }
    ]
  },
  '200': {
    method: 'numIslands',
    argTypes: ['char[][]'],
    returnType: 'int',
    debugTests: [
      { name: '单个大岛屿', args: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], expected: 1 },
      { name: '三个岛屿', args: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], expected: 3 },
      { name: '全是水', args: [[['0', '0'], ['0', '0']]], expected: 0 }
    ],
    submissionTests: [
      { name: '单格陆地', args: [[['1']]], expected: 1 },
      { name: '单格水域', args: [[['0']]], expected: 0 },
      { name: '对角线不连通', args: [[['1', '0'], ['0', '1']]], expected: 2 },
      { name: '环形陆地', args: [[['1', '1', '1'], ['1', '0', '1'], ['1', '1', '1']]], expected: 1 },
      { name: '棋盘分布', args: [[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], expected: 5 }
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
  '207': {
    method: 'canFinish',
    argTypes: ['int', 'int[][]'],
    returnType: 'boolean',
    debugTests: [
      { name: '简单依赖', args: [2, [[1, 0]]], expected: true },
      { name: '二节点成环', args: [2, [[1, 0], [0, 1]]], expected: false },
      { name: '无先修课程', args: [3, []], expected: true }
    ],
    submissionTests: [
      { name: '依赖链', args: [4, [[1, 0], [2, 1], [3, 2]]], expected: true },
      { name: '长环', args: [4, [[1, 0], [2, 1], [3, 2], [0, 3]]], expected: false },
      { name: '多条入边', args: [4, [[2, 0], [2, 1], [3, 2]]], expected: true },
      { name: '独立分量含环', args: [5, [[1, 0], [3, 2], [2, 3]]], expected: false },
      { name: '单课程', args: [1, []], expected: true }
    ]
  },
  '215': {
    method: 'findKthLargest',
    argTypes: ['int[]', 'int'],
    returnType: 'int',
    debugTests: [
      { name: '第二大元素', args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { name: '包含重复值', args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { name: '单元素', args: [[1], 1], expected: 1 }
    ],
    submissionTests: [
      { name: '最大元素', args: [[7, 2, 9, 1], 1], expected: 9 },
      { name: '最小元素', args: [[7, 2, 9, 1], 4], expected: 1 },
      { name: '全相同', args: [[2, 2, 2, 2], 3], expected: 2 },
      { name: '包含负数', args: [[-1, -5, 0, 3, 2], 3], expected: 0 },
      { name: '重复值计入排名', args: [[5, 5, 4, 4, 3], 2], expected: 5 }
    ]
  },
  '236': {
    fixture: 'treeTargets',
    method: 'lowestCommonAncestor',
    returnType: 'TreeNodeValue',
    debugTests: [
      { name: '分居根节点两侧', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
      { name: '祖先是节点本身', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
      { name: '双节点树', args: [[1, 2], 1, 2], expected: 1 }
    ],
    submissionTests: [
      { name: '同一子树内', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5], expected: 4 },
      { name: '跨越根节点', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 0, 9], expected: 6 },
      { name: '父子节点', args: [[1, 2, 3, 4, 5], 2, 5], expected: 2 },
      { name: '深层不同分支', args: [[1, 2, 3, 4, 5, 6, 7], 4, 5], expected: 2 },
      { name: '根节点参与', args: [[1, 2, 3, 4, 5], 1, 5], expected: 1 }
    ]
  },
  '322': {
    method: 'coinChange',
    argTypes: ['int[]', 'int'],
    returnType: 'int',
    debugTests: [
      { name: '常规组合', args: [[1, 2, 5], 11], expected: 3 },
      { name: '无法凑出', args: [[2], 3], expected: -1 },
      { name: '金额为零', args: [[1], 0], expected: 0 }
    ],
    submissionTests: [
      { name: '单枚硬币', args: [[2], 2], expected: 1 },
      { name: '贪心失效场景', args: [[1, 3, 4], 6], expected: 2 },
      { name: '大面额不可用', args: [[2, 5, 10], 1], expected: -1 },
      { name: '重复使用硬币', args: [[3, 7], 21], expected: 3 },
      { name: '多种组合取最少', args: [[2, 3, 5], 8], expected: 2 }
    ]
  },
  '347': {
    method: 'topKFrequent',
    argTypes: ['int[]', 'int'],
    returnType: 'int[]',
    comparison: 'unordered',
    debugTests: [
      { name: '两个高频元素', args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { name: '单元素', args: [[1], 1], expected: [1] },
      { name: '包含负数', args: [[-1, -1, 2, 2, 2, 3], 2], expected: [-1, 2] }
    ],
    submissionTests: [
      { name: '取全部不同元素', args: [[1, 2, 3], 3], expected: [1, 2, 3] },
      { name: '一个明显高频项', args: [[4, 4, 4, 4, 2, 2, 3], 1], expected: [4] },
      { name: '零与负数', args: [[0, 0, -1, -1, -1, 2], 2], expected: [0, -1] },
      { name: '多个频率层级', args: [[1, 1, 1, 2, 2, 3, 3, 3, 3], 2], expected: [1, 3] },
      { name: '重复值数组', args: [[5, 5, 5, 5], 1], expected: [5] }
    ]
  },
  '560': {
    method: 'subarraySum',
    argTypes: ['int[]', 'int'],
    returnType: 'int',
    debugTests: [
      { name: '两个连续答案', args: [[1, 1, 1], 2], expected: 2 },
      { name: '不同长度子数组', args: [[1, 2, 3], 3], expected: 2 },
      { name: '包含负数', args: [[1, -1, 0], 0], expected: 3 }
    ],
    submissionTests: [
      { name: '单元素命中', args: [[3], 3], expected: 1 },
      { name: '单元素未命中', args: [[3], 0], expected: 0 },
      { name: '全零', args: [[0, 0, 0], 0], expected: 6 },
      { name: '正负抵消', args: [[1, -1, 1, -1], 0], expected: 4 },
      { name: '负目标值', args: [[-1, -1, 1], -1], expected: 3 },
      { name: '前缀重复', args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 }
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
  },
  '739': {
    method: 'dailyTemperatures',
    argTypes: ['int[]'],
    returnType: 'int[]',
    debugTests: [
      { name: '官方样例', args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { name: '连续升温', args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
      { name: '间隔升温', args: [[30, 60, 90]], expected: [1, 1, 0] }
    ],
    submissionTests: [
      { name: '持续降温', args: [[90, 80, 70]], expected: [0, 0, 0] },
      { name: '温度相等不算更暖', args: [[70, 70, 70]], expected: [0, 0, 0] },
      { name: '末尾才升温', args: [[70, 69, 68, 80]], expected: [3, 2, 1, 0] },
      { name: '单日', args: [[50]], expected: [0] },
      { name: '交替温度', args: [[70, 80, 70, 80, 90]], expected: [1, 3, 1, 1, 0] }
    ]
  }
};
