export const references = {
  '1': {
    hints: [
      '遍历到 nums[i] 时，只需要知道 target - nums[i] 是否在前面出现过。',
      '哈希表保存“数值 -> 下标”。先查补数，再写入当前值，可避免重复使用同一元素。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indices = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (indices.containsKey(complement)) {
                return new int[]{indices.get(complement), i};
            }
            indices.put(nums[i], i);
        }
        throw new IllegalStateException("No solution");
    }
}`,
    javascript: `class Solution {
  twoSum(nums, target) {
    const indices = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (indices.has(complement)) {
        return [indices.get(complement), i];
      }
      indices.set(nums[i], i);
    }
    throw new Error('No solution');
  }
}`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        indices = {}
        for i, value in enumerate(nums):
            complement = target - value
            if complement in indices:
                return [indices[complement], i]
            indices[value] = i
        raise RuntimeError("No solution")`
  },
  '3': {
    hints: [
      '维护一个不含重复字符的滑动窗口，右指针每次加入一个字符。',
      '记录字符最近出现的位置；重复字符仍在窗口内时，把左边界跳到它的后一位。'
    ],
    complexity: '时间 O(n)，空间 O(min(n, 字符集大小))。',
    java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastIndex = new HashMap<>();
        int left = 0;
        int answer = 0;
        for (int right = 0; right < s.length(); right++) {
            char current = s.charAt(right);
            if (lastIndex.containsKey(current)) {
                left = Math.max(left, lastIndex.get(current) + 1);
            }
            lastIndex.put(current, right);
            answer = Math.max(answer, right - left + 1);
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  lengthOfLongestSubstring(s) {
    const lastIndex = new Map();
    let left = 0;
    let answer = 0;
    for (let right = 0; right < s.length; right++) {
      const current = s[right];
      if (lastIndex.has(current)) {
        left = Math.max(left, lastIndex.get(current) + 1);
      }
      lastIndex.set(current, right);
      answer = Math.max(answer, right - left + 1);
    }
    return answer;
  }
}`,
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last_index = {}
        left = 0
        answer = 0
        for right, current in enumerate(s):
            if current in last_index:
                left = max(left, last_index[current] + 1)
            last_index[current] = right
            answer = max(answer, right - left + 1)
        return answer`
  },
  '15': {
    hints: [
      '先排序，把三数之和转成“固定一个数，再寻找两数之和”。',
      '左右指针根据当前和移动，并跳过与前一个相同的值，避免重复三元组。'
    ],
    complexity: '时间 O(n²)，排序之外的额外空间 O(1)，返回结果不计入空间。',
    java: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> answer = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            if (nums[i] > 0) break;
            int left = i + 1;
            int right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) {
                    left++;
                } else if (sum > 0) {
                    right--;
                } else {
                    answer.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    int leftValue = nums[left];
                    int rightValue = nums[right];
                    while (left < right && nums[left] == leftValue) left++;
                    while (left < right && nums[right] == rightValue) right--;
                }
            }
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  threeSum(nums) {
    nums.sort((a, b) => a - b);
    const answer = [];
    for (let i = 0; i < nums.length - 2; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue;
      if (nums[i] > 0) break;
      let left = i + 1;
      let right = nums.length - 1;
      while (left < right) {
        const sum = nums[i] + nums[left] + nums[right];
        if (sum < 0) {
          left++;
        } else if (sum > 0) {
          right--;
        } else {
          answer.push([nums[i], nums[left], nums[right]]);
          const leftValue = nums[left];
          const rightValue = nums[right];
          while (left < right && nums[left] === leftValue) left++;
          while (left < right && nums[right] === rightValue) right--;
        }
      }
    }
    return answer;
  }
}`,
    python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        answer = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            if nums[i] > 0:
                break
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    answer.append([nums[i], nums[left], nums[right]])
                    left_value, right_value = nums[left], nums[right]
                    while left < right and nums[left] == left_value:
                        left += 1
                    while left < right and nums[right] == right_value:
                        right -= 1
        return answer`
  },
  '20': {
    hints: [
      '遇到左括号时，把它期望匹配的右括号压入栈。',
      '遇到右括号时，它必须等于栈顶；最后栈也必须为空。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.ArrayDeque;
import java.util.Deque;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> expected = new ArrayDeque<>();
        for (char current : s.toCharArray()) {
            if (current == '(') expected.push(')');
            else if (current == '[') expected.push(']');
            else if (current == '{') expected.push('}');
            else if (expected.isEmpty() || expected.pop() != current) return false;
        }
        return expected.isEmpty();
    }
}`,
    javascript: `class Solution {
  isValid(s) {
    const expected = [];
    for (const current of s) {
      if (current === '(') expected.push(')');
      else if (current === '[') expected.push(']');
      else if (current === '{') expected.push('}');
      else if (expected.pop() !== current) return false;
    }
    return expected.length === 0;
  }
}`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        expected = []
        pairs = {'(': ')', '[': ']', '{': '}'}
        for current in s:
            if current in pairs:
                expected.append(pairs[current])
            elif not expected or expected.pop() != current:
                return False
        return not expected`
  },
  '33': {
    hints: [
      '旋转数组在任意二分位置，至少有一侧仍然有序。',
      '先判断哪一侧有序，再判断 target 是否落在该侧的值域中，以决定保留哪半边。'
    ],
    complexity: '时间 O(log n)，空间 O(1)。',
    java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int middle = left + (right - left) / 2;
            if (nums[middle] == target) return middle;
            if (nums[left] <= nums[middle]) {
                if (nums[left] <= target && target < nums[middle]) right = middle - 1;
                else left = middle + 1;
            } else {
                if (nums[middle] < target && target <= nums[right]) left = middle + 1;
                else right = middle - 1;
            }
        }
        return -1;
    }
}`,
    javascript: `class Solution {
  search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
      const middle = left + Math.floor((right - left) / 2);
      if (nums[middle] === target) return middle;
      if (nums[left] <= nums[middle]) {
        if (nums[left] <= target && target < nums[middle]) right = middle - 1;
        else left = middle + 1;
      } else {
        if (nums[middle] < target && target <= nums[right]) left = middle + 1;
        else right = middle - 1;
      }
    }
    return -1;
  }
}`,
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            middle = left + (right - left) // 2
            if nums[middle] == target:
                return middle
            if nums[left] <= nums[middle]:
                if nums[left] <= target < nums[middle]:
                    right = middle - 1
                else:
                    left = middle + 1
            else:
                if nums[middle] < target <= nums[right]:
                    left = middle + 1
                else:
                    right = middle - 1
        return -1`
  },
  '46': {
    hints: [
      '回溯过程的状态是“当前排列”和“哪些元素已经使用”。',
      '每层选择一个尚未使用的元素，递归后撤销选择；长度等于 n 时收集答案。'
    ],
    complexity: '时间 O(n · n!)，空间 O(n)（不计返回结果）。',
    java: `import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> answer = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), answer);
        return answer;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path,
                           List<List<Integer>> answer) {
        if (path.size() == nums.length) {
            answer.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, answer);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`,
    javascript: `class Solution {
  permute(nums) {
    const answer = [];
    const path = [];
    const used = Array(nums.length).fill(false);
    const backtrack = () => {
      if (path.length === nums.length) {
        answer.push([...path]);
        return;
      }
      for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.push(nums[i]);
        backtrack();
        path.pop();
        used[i] = false;
      }
    };
    backtrack();
    return answer;
  }
}`,
    python: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        answer = []
        path = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                answer.append(path.copy())
                return
            for i, value in enumerate(nums):
                if used[i]:
                    continue
                used[i] = True
                path.append(value)
                backtrack()
                path.pop()
                used[i] = False

        backtrack()
        return answer`
  },
  '49': {
    hints: [
      '字母异位词排序后会得到相同的字符串，可以用它作为分组键。',
      '哈希表保存“排序后的键 -> 原字符串列表”，最后返回所有分组。'
    ],
    complexity: '设最长字符串长度为 k：时间 O(n · k log k)，空间 O(n · k)。',
    java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String value : strs) {
            char[] letters = value.toCharArray();
            java.util.Arrays.sort(letters);
            String key = new String(letters);
            groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(value);
        }
        return new ArrayList<>(groups.values());
    }
}`,
    javascript: `class Solution {
  groupAnagrams(strs) {
    const groups = new Map();
    for (const value of strs) {
      const key = [...value].sort().join('');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(value);
    }
    return [...groups.values()];
  }
}`,
    python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = {}
        for value in strs:
            key = ''.join(sorted(value))
            groups.setdefault(key, []).append(value)
        return list(groups.values())`
  },
  '53': {
    hints: [
      '以当前位置结尾的最大子数组，要么从当前数重新开始，要么接在前一个最优结尾之后。',
      '用 current 记录“以当前位结尾的最大和”，用 answer 记录全局最大值。'
    ],
    complexity: '时间 O(n)，空间 O(1)。',
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        int current = nums[0];
        int answer = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            answer = Math.max(answer, current);
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  maxSubArray(nums) {
    let current = nums[0];
    let answer = nums[0];
    for (let i = 1; i < nums.length; i++) {
      current = Math.max(nums[i], current + nums[i]);
      answer = Math.max(answer, current);
    }
    return answer;
  }
}`,
    python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        current = answer = nums[0]
        for value in nums[1:]:
            current = max(value, current + value)
            answer = max(answer, current)
        return answer`
  },
  '56': {
    hints: [
      '先按区间起点排序，相交区间就会相邻出现。',
      '当前区间起点不超过已合并区间的终点时更新终点，否则开启一个新区间。'
    ],
    complexity: '时间 O(n log n)，空间 O(n)（包含返回结果）。',
    java: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(new int[]{interval[0], interval[1]});
            } else {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], interval[1]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}`,
    javascript: `class Solution {
  merge(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const interval of intervals) {
      const last = merged[merged.length - 1];
      if (!last || last[1] < interval[0]) {
        merged.push([...interval]);
      } else {
        last[1] = Math.max(last[1], interval[1]);
      }
    }
    return merged;
  }
}`,
    python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda interval: interval[0])
        merged = []
        for start, end in intervals:
            if not merged or merged[-1][1] < start:
                merged.append([start, end])
            else:
                merged[-1][1] = max(merged[-1][1], end)
        return merged`
  },
  '98': {
    hints: [
      '不能只比较节点与直接子节点；左子树的所有值都必须小于当前节点，右子树同理。',
      '递归时携带当前节点允许的开区间 (lower, upper)，每深入一层就收紧边界。'
    ],
    complexity: '时间 O(n)，空间 O(h)，h 为树高。',
    java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean validate(TreeNode node, long lower, long upper) {
        if (node == null) return true;
        if (node.val <= lower || node.val >= upper) return false;
        return validate(node.left, lower, node.val)
            && validate(node.right, node.val, upper);
    }
}`,
    javascript: `class Solution {
  isValidBST(root) {
    const validate = (node, lower, upper) => {
      if (node === null) return true;
      if (node.val <= lower || node.val >= upper) return false;
      return validate(node.left, lower, node.val)
        && validate(node.right, node.val, upper);
    };
    return validate(root, -Infinity, Infinity);
  }
}`,
    python: `class Solution:
    def isValidBST(self, root: TreeNode | None) -> bool:
        def validate(node, lower, upper):
            if node is None:
                return True
            if node.val <= lower or node.val >= upper:
                return False
            return (validate(node.left, lower, node.val)
                    and validate(node.right, node.val, upper))

        return validate(root, float('-inf'), float('inf'))`
  },
  '102': {
    hints: [
      '层序遍历就是广度优先搜索，队列中保存下一批待访问节点。',
      '每轮先记下队列长度，只弹出这一层的节点，并把它们的子节点加入队尾。'
    ],
    complexity: '时间 O(n)，空间 O(w)，w 为树的最大宽度。',
    java: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> answer = new ArrayList<>();
        if (root == null) return answer;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> level = new ArrayList<>(levelSize);
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            answer.add(level);
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  levelOrder(root) {
    if (root === null) return [];
    const answer = [];
    const queue = [root];
    let head = 0;
    while (head < queue.length) {
      const levelEnd = queue.length;
      const level = [];
      while (head < levelEnd) {
        const node = queue[head++];
        level.push(node.val);
        if (node.left !== null) queue.push(node.left);
        if (node.right !== null) queue.push(node.right);
      }
      answer.push(level);
    }
    return answer;
  }
}`,
    python: `from collections import deque

class Solution:
    def levelOrder(self, root: TreeNode | None) -> list[list[int]]:
        if root is None:
            return []
        answer = []
        queue = deque([root])
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            answer.append(level)
        return answer`
  },
  '141': {
    hints: [
      '让一个指针每次走一步，另一个每次走两步。',
      '如果链表有环，快指针最终会从后面追上慢指针；无环时快指针会先到 null。'
    ],
    complexity: '时间 O(n)，空间 O(1)。',
    java: `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
    javascript: `class Solution {
  hasCycle(head) {
    let slow = head;
    let fast = head;
    while (fast !== null && fast.next !== null) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  }
}`,
    python: `class Solution:
    def hasCycle(self, head: ListNode | None) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False`
  },
  '146': {
    hints: [
      '需要同时满足 O(1) 查找和 O(1) 更新最近使用顺序：哈希表负责查找，双向链表负责顺序。',
      '链表头部放最近使用项，尾部放最久未使用项；get 和 put 命中后都把节点移到头部。'
    ],
    complexity: 'get 和 put 的时间均为 O(1)，空间 O(capacity)。',
    java: `import java.util.HashMap;
import java.util.Map;

class LRUCache {
    private static class Node {
        int key;
        int value;
        Node previous;
        Node next;

        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    private final int capacity;
    private final Map<Integer, Node> nodes = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.previous = head;
    }

    public int get(int key) {
        Node node = nodes.get(key);
        if (node == null) return -1;
        moveToFront(node);
        return node.value;
    }

    public void put(int key, int value) {
        Node existing = nodes.get(key);
        if (existing != null) {
            existing.value = value;
            moveToFront(existing);
            return;
        }
        Node node = new Node(key, value);
        nodes.put(key, node);
        addFirst(node);
        if (nodes.size() > capacity) {
            Node removed = tail.previous;
            remove(removed);
            nodes.remove(removed.key);
        }
    }

    private void moveToFront(Node node) {
        remove(node);
        addFirst(node);
    }

    private void addFirst(Node node) {
        node.next = head.next;
        node.previous = head;
        head.next.previous = node;
        head.next = node;
    }

    private void remove(Node node) {
        node.previous.next = node.next;
        node.next.previous = node.previous;
    }
}`,
    javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      const leastRecentlyUsed = this.cache.keys().next().value;
      this.cache.delete(leastRecentlyUsed);
    }
  }
}`,
    python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`
  },
  '198': {
    hints: [
      '到第 i 间房时，选择只有两种：不偷它，或偷它并加上 i - 2 的最优值。',
      '状态转移是 dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])，只需保留前两个状态。'
    ],
    complexity: '时间 O(n)，空间 O(1)。',
    java: `class Solution {
    public int rob(int[] nums) {
        int twoBack = 0;
        int oneBack = 0;
        for (int money : nums) {
            int current = Math.max(oneBack, twoBack + money);
            twoBack = oneBack;
            oneBack = current;
        }
        return oneBack;
    }
}`,
    javascript: `class Solution {
  rob(nums) {
    let twoBack = 0;
    let oneBack = 0;
    for (const money of nums) {
      const current = Math.max(oneBack, twoBack + money);
      twoBack = oneBack;
      oneBack = current;
    }
    return oneBack;
  }
}`,
    python: `class Solution:
    def rob(self, nums: list[int]) -> int:
        two_back = one_back = 0
        for money in nums:
            two_back, one_back = one_back, max(one_back, two_back + money)
        return one_back`
  },
  '200': {
    hints: [
      '扫描网格，每遇到一个尚未访问的陆地，就发现了一个新岛屿。',
      '从该陆地做 DFS/BFS，把连通的所有陆地标记为已访问，再继续扫描。'
    ],
    complexity: '时间 O(mn)，最坏空间 O(mn)。',
    java: `class Solution {
    public int numIslands(char[][] grid) {
        int islands = 0;
        for (int row = 0; row < grid.length; row++) {
            for (int column = 0; column < grid[0].length; column++) {
                if (grid[row][column] == '1') {
                    islands++;
                    sink(grid, row, column);
                }
            }
        }
        return islands;
    }

    private void sink(char[][] grid, int row, int column) {
        if (row < 0 || row >= grid.length || column < 0 || column >= grid[0].length
                || grid[row][column] != '1') return;
        grid[row][column] = '0';
        sink(grid, row - 1, column);
        sink(grid, row + 1, column);
        sink(grid, row, column - 1);
        sink(grid, row, column + 1);
    }
}`,
    javascript: `class Solution {
  numIslands(grid) {
    let islands = 0;
    const rows = grid.length;
    const columns = grid[0].length;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (grid[row][column] !== '1') continue;
        islands++;
        const stack = [[row, column]];
        grid[row][column] = '0';
        while (stack.length > 0) {
          const [currentRow, currentColumn] = stack.pop();
          for (const [rowStep, columnStep] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nextRow = currentRow + rowStep;
            const nextColumn = currentColumn + columnStep;
            if (nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns
                && grid[nextRow][nextColumn] === '1') {
              grid[nextRow][nextColumn] = '0';
              stack.push([nextRow, nextColumn]);
            }
          }
        }
      }
    }
    return islands;
  }
}`,
    python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, columns = len(grid), len(grid[0])
        islands = 0
        for row in range(rows):
            for column in range(columns):
                if grid[row][column] != '1':
                    continue
                islands += 1
                stack = [(row, column)]
                grid[row][column] = '0'
                while stack:
                    current_row, current_column = stack.pop()
                    for row_step, column_step in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        next_row = current_row + row_step
                        next_column = current_column + column_step
                        if (0 <= next_row < rows and 0 <= next_column < columns
                                and grid[next_row][next_column] == '1'):
                            grid[next_row][next_column] = '0'
                            stack.append((next_row, next_column))
        return islands`
  },
  '206': {
    hints: [
      '遍历链表时，需要同时保存前一个节点和下一个节点。',
      '先保存 current.next，再把 current.next 指向 previous，最后整体向前移动。'
    ],
    complexity: '时间 O(n)，空间 O(1)。',
    java: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode previous = null;
        ListNode current = head;
        while (current != null) {
            ListNode next = current.next;
            current.next = previous;
            previous = current;
            current = next;
        }
        return previous;
    }
}`,
    javascript: `class Solution {
  reverseList(head) {
    let previous = null;
    let current = head;
    while (current !== null) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }
    return previous;
  }
}`,
    python: `class Solution:
    def reverseList(self, head: ListNode | None) -> ListNode | None:
        previous = None
        current = head
        while current:
            next_node = current.next
            current.next = previous
            previous = current
            current = next_node
        return previous`
  },
  '207': {
    hints: [
      '把课程看作有向图：先修课指向后续课程；问题等价于判断图中是否有环。',
      '统计每门课的入度，从入度为 0 的课程开始拓扑排序；最终处理完全部课程才可完成。'
    ],
    complexity: '时间 O(V + E)，空间 O(V + E)。',
    java: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int required = prerequisite[1];
            graph.get(required).add(course);
            indegree[course]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int course = 0; course < numCourses; course++) {
            if (indegree[course] == 0) queue.offer(course);
        }
        int completed = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            completed++;
            for (int next : graph.get(course)) {
                if (--indegree[next] == 0) queue.offer(next);
            }
        }
        return completed == numCourses;
    }
}`,
    javascript: `class Solution {
  canFinish(numCourses, prerequisites) {
    const graph = Array.from({ length: numCourses }, () => []);
    const indegree = Array(numCourses).fill(0);
    for (const [course, required] of prerequisites) {
      graph[required].push(course);
      indegree[course]++;
    }
    const queue = [];
    for (let course = 0; course < numCourses; course++) {
      if (indegree[course] === 0) queue.push(course);
    }
    let completed = 0;
    for (let head = 0; head < queue.length; head++) {
      const course = queue[head];
      completed++;
      for (const next of graph[course]) {
        indegree[next]--;
        if (indegree[next] === 0) queue.push(next);
      }
    }
    return completed === numCourses;
  }
}`,
    python: `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for course, required in prerequisites:
            graph[required].append(course)
            indegree[course] += 1
        queue = deque(course for course in range(numCourses) if indegree[course] == 0)
        completed = 0
        while queue:
            course = queue.popleft()
            completed += 1
            for next_course in graph[course]:
                indegree[next_course] -= 1
                if indegree[next_course] == 0:
                    queue.append(next_course)
        return completed == numCourses`
  },
  '215': {
    hints: [
      '维护一个大小不超过 k 的最小堆，堆中始终保留目前最大的 k 个数。',
      '遍历结束后，堆顶正是这 k 个数里最小的，也就是整体第 k 大。'
    ],
    complexity: '时间 O(n log k)，空间 O(k)。',
    java: `import java.util.PriorityQueue;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> largest = new PriorityQueue<>();
        for (int value : nums) {
            largest.offer(value);
            if (largest.size() > k) largest.poll();
        }
        return largest.peek();
    }
}`,
    javascript: `class Solution {
  findKthLargest(nums, k) {
    const heap = [];
    const push = (value) => {
      heap.push(value);
      let index = heap.length - 1;
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (heap[parent] <= heap[index]) break;
        [heap[parent], heap[index]] = [heap[index], heap[parent]];
        index = parent;
      }
    };
    const pop = () => {
      heap[0] = heap.pop();
      let index = 0;
      while (index < heap.length) {
        let smallest = index;
        const left = index * 2 + 1;
        const right = left + 1;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        if (smallest === index) break;
        [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
        index = smallest;
      }
    };
    for (const value of nums) {
      push(value);
      if (heap.length > k) pop();
    }
    return heap[0];
  }
}`,
    python: `import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        largest = []
        for value in nums:
            heapq.heappush(largest, value)
            if len(largest) > k:
                heapq.heappop(largest)
        return largest[0]`
  },
  '236': {
    hints: [
      '递归搜索左右子树；遇到 null、p 或 q 时直接返回当前节点。',
      '左右子树都返回非空，说明 p、q 分居两侧，当前节点就是最近公共祖先；否则返回非空的一侧。'
    ],
    complexity: '时间 O(n)，空间 O(h)，h 为树高。',
    java: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
    javascript: `class Solution {
  lowestCommonAncestor(root, p, q) {
    if (root === null || root === p || root === q) return root;
    const left = this.lowestCommonAncestor(root.left, p, q);
    const right = this.lowestCommonAncestor(root.right, p, q);
    if (left !== null && right !== null) return root;
    return left !== null ? left : right;
  }
}`,
    python: `class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        if root is None or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left is not None and right is not None:
            return root
        return left if left is not None else right`
  },
  '322': {
    hints: [
      '令 dp[x] 表示凑出金额 x 所需的最少硬币数。',
      '对每个金额尝试所有不大于它的硬币：dp[x] = min(dp[x], dp[x - coin] + 1)。'
    ],
    complexity: '时间 O(amount · 硬币种数)，空间 O(amount)。',
    java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] minimum = new int[amount + 1];
        Arrays.fill(minimum, amount + 1);
        minimum[0] = 0;
        for (int current = 1; current <= amount; current++) {
            for (int coin : coins) {
                if (coin <= current) {
                    minimum[current] = Math.min(minimum[current], minimum[current - coin] + 1);
                }
            }
        }
        return minimum[amount] > amount ? -1 : minimum[amount];
    }
}`,
    javascript: `class Solution {
  coinChange(coins, amount) {
    const minimum = Array(amount + 1).fill(amount + 1);
    minimum[0] = 0;
    for (let current = 1; current <= amount; current++) {
      for (const coin of coins) {
        if (coin <= current) {
          minimum[current] = Math.min(minimum[current], minimum[current - coin] + 1);
        }
      }
    }
    return minimum[amount] > amount ? -1 : minimum[amount];
  }
}`,
    python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        minimum = [amount + 1] * (amount + 1)
        minimum[0] = 0
        for current in range(1, amount + 1):
            for coin in coins:
                if coin <= current:
                    minimum[current] = min(minimum[current], minimum[current - coin] + 1)
        return -1 if minimum[amount] > amount else minimum[amount]`
  },
  '347': {
    hints: [
      '先统计每个数字的出现次数，频率最大不会超过数组长度。',
      '建立“频率 -> 数字列表”的桶，从高频桶向低频桶收集，直到得到 k 个数字。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequency = new HashMap<>();
        for (int value : nums) frequency.merge(value, 1, Integer::sum);
        List<Integer>[] buckets = new List[nums.length + 1];
        for (Map.Entry<Integer, Integer> entry : frequency.entrySet()) {
            int count = entry.getValue();
            if (buckets[count] == null) buckets[count] = new ArrayList<>();
            buckets[count].add(entry.getKey());
        }
        int[] answer = new int[k];
        int index = 0;
        for (int count = buckets.length - 1; count >= 0 && index < k; count--) {
            if (buckets[count] == null) continue;
            for (int value : buckets[count]) {
                answer[index++] = value;
                if (index == k) break;
            }
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  topKFrequent(nums, k) {
    const frequency = new Map();
    for (const value of nums) {
      frequency.set(value, (frequency.get(value) ?? 0) + 1);
    }
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [value, count] of frequency) buckets[count].push(value);
    const answer = [];
    for (let count = buckets.length - 1; count >= 0 && answer.length < k; count--) {
      for (const value of buckets[count]) {
        answer.push(value);
        if (answer.length === k) break;
      }
    }
    return answer;
  }
}`,
    python: `class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        frequency = {}
        for value in nums:
            frequency[value] = frequency.get(value, 0) + 1
        buckets = [[] for _ in range(len(nums) + 1)]
        for value, count in frequency.items():
            buckets[count].append(value)
        answer = []
        for count in range(len(buckets) - 1, 0, -1):
            for value in buckets[count]:
                answer.append(value)
                if len(answer) == k:
                    return answer
        return answer`
  },
  '560': {
    hints: [
      '子数组和可以写成两个前缀和之差：prefix[j] - prefix[i] = k。',
      '遍历当前前缀和 prefix 时，答案增加此前 prefix - k 出现的次数；再记录当前 prefix。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> counts = new HashMap<>();
        counts.put(0, 1);
        int prefix = 0;
        int answer = 0;
        for (int value : nums) {
            prefix += value;
            answer += counts.getOrDefault(prefix - k, 0);
            counts.put(prefix, counts.getOrDefault(prefix, 0) + 1);
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  subarraySum(nums, k) {
    const counts = new Map([[0, 1]]);
    let prefix = 0;
    let answer = 0;
    for (const value of nums) {
      prefix += value;
      answer += counts.get(prefix - k) ?? 0;
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
    return answer;
  }
}`,
    python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        counts = {0: 1}
        prefix = 0
        answer = 0
        for value in nums:
            prefix += value
            answer += counts.get(prefix - k, 0)
            counts[prefix] = counts.get(prefix, 0) + 1
        return answer`
  },
  '704': {
    hints: [
      '维护闭区间 [left, right]，每次比较中点与 target。',
      'Java 中整数除法会自动向零取整，不需要 Math.floor；中点写成 left + (right - left) / 2。'
    ],
    complexity: '时间 O(log n)，空间 O(1)。',
    java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int middle = left + (right - left) / 2;
            if (nums[middle] == target) return middle;
            if (nums[middle] < target) left = middle + 1;
            else right = middle - 1;
        }
        return -1;
    }
}`,
    javascript: `class Solution {
  search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
      const middle = left + Math.floor((right - left) / 2);
      if (nums[middle] === target) return middle;
      if (nums[middle] < target) left = middle + 1;
      else right = middle - 1;
    }
    return -1;
  }
}`,
    python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            middle = left + (right - left) // 2
            if nums[middle] == target:
                return middle
            if nums[middle] < target:
                left = middle + 1
            else:
                right = middle - 1
        return -1`
  },
  '739': {
    hints: [
      '栈中保存还没找到更暖一天的日期下标，并让对应温度保持单调递减。',
      '当前温度高于栈顶日期温度时，栈顶答案就是两个下标之差；持续弹栈直到恢复单调性。'
    ],
    complexity: '时间 O(n)，空间 O(n)。',
    java: `import java.util.ArrayDeque;
import java.util.Deque;

class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int[] answer = new int[temperatures.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int day = 0; day < temperatures.length; day++) {
            while (!stack.isEmpty() && temperatures[day] > temperatures[stack.peek()]) {
                int previousDay = stack.pop();
                answer[previousDay] = day - previousDay;
            }
            stack.push(day);
        }
        return answer;
    }
}`,
    javascript: `class Solution {
  dailyTemperatures(temperatures) {
    const answer = Array(temperatures.length).fill(0);
    const stack = [];
    for (let day = 0; day < temperatures.length; day++) {
      while (stack.length > 0 && temperatures[day] > temperatures[stack[stack.length - 1]]) {
        const previousDay = stack.pop();
        answer[previousDay] = day - previousDay;
      }
      stack.push(day);
    }
    return answer;
  }
}`,
    python: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        answer = [0] * len(temperatures)
        stack = []
        for day, temperature in enumerate(temperatures):
            while stack and temperature > temperatures[stack[-1]]:
                previous_day = stack.pop()
                answer[previous_day] = day - previous_day
            stack.append(day)
        return answer`
  }
};
