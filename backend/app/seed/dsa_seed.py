"""
Phase 12 Stage 2: Canonical Topic-by-Topic DSA Hierarchy Seed Catalog
Covers 28 canonical topics grouped into 5 comprehensive domains, with explicit
Easy, Medium, and Hard difficulty classifications, learning objectives, common patterns,
common pitfalls, and verified practice resources (LeetCode, GFG, Striver, NeetCode).
"""

DSA_CATALOG = [
    {
        "slug": "linear-data-structures",
        "name": "Linear Data Structures",
        "description": "Sequential memory layouts, contiguous buffers, and pointer-linked nodes.",
        "order": 1,
        "topics": [
            {
                "slug": "arrays",
                "name": "Arrays & Dynamic Arrays",
                "description": "Contiguous memory allocations, index arithmetic, vector resizing, and prefix sums.",
                "order": 1,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": [],
                "subtopics": [
                    {
                        "slug": "array-basics",
                        "name": "Array Fundamentals & Prefix Sums",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "array-traversal-insertion",
                                "name": "Array Traversal & In-Place Modification",
                                "difficulty": "EASY",
                                "learning_objectives": ["Understand O(1) random access", "Perform in-place element shifts", "Compute running prefix sums"],
                                "common_patterns": ["Running Prefix Sum", "In-place element overwrite"],
                                "common_mistakes": ["Off-by-one boundary index error", "Inefficient O(N) insertion within loops"],
                                "practice_resources": [
                                    {"title": "Running Sum of 1d Array", "url": "https://leetcode.com/problems/running-sum-of-1d-array/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"},
                                    {"title": "Array Data Structure Guide", "url": "https://www.geeksforgeeks.org/array-data-structure/", "type": "ARTICLE", "is_free": True, "platform": "GeeksforGeeks"}
                                ]
                            },
                            {
                                "slug": "prefix-sum-hashmap",
                                "name": "Subarray Sum Equals K (Prefix Sum + Hashing)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Identify cumulative prefix differences", "Use hashmap to store frequency of prefix sums in O(N)"],
                                "common_patterns": ["PrefixSum[j] - PrefixSum[i] = K", "Remainder modulo hashing"],
                                "common_mistakes": ["Forgetting to initialize map with {0: 1}", "Assuming all elements are positive"],
                                "practice_resources": [
                                    {"title": "Subarray Sum Equals K", "url": "https://leetcode.com/problems/subarray-sum-equals-k/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "strings",
                "name": "Strings & Character Manipulation",
                "description": "Character arrays, ASCII/Unicode encoding, palindrome verification, and string hashing.",
                "order": 2,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays"],
                "subtopics": [
                    {
                        "slug": "string-basics",
                        "name": "String Traversal & Anagrams",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "valid-anagram",
                                "name": "Valid Anagram & Frequency Arrays",
                                "difficulty": "EASY",
                                "learning_objectives": ["Count character frequencies using 26-element array", "Compare strings in O(N) time"],
                                "common_patterns": ["Fixed-size frequency bucket", "ASCII normalization"],
                                "common_mistakes": ["Creating full hashmap when fixed 26-int array is sufficient", "Ignoring non-alphanumeric chars without asking"],
                                "practice_resources": [
                                    {"title": "Valid Anagram", "url": "https://leetcode.com/problems/valid-anagram/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "group-anagrams",
                                "name": "Group Anagrams by Canonical Signature",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Hash strings using sorted tuples or count strings as map keys", "Aggregate anagram groups in O(N * K)"],
                                "common_patterns": ["Categorize by Sorted String", "Tuple count hashing"],
                                "common_mistakes": ["Using unhashable dictionary types as map keys in Python"],
                                "practice_resources": [
                                    {"title": "Group Anagrams", "url": "https://leetcode.com/problems/group-anagrams/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "linked-lists",
                "name": "Linked Lists (Singly, Doubly, Circular)",
                "description": "Pointer-based sequential data nodes, head/tail sentinels, reversal, and cycle detection.",
                "order": 3,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": [],
                "subtopics": [
                    {
                        "slug": "linked-list-operations",
                        "name": "Pointer Manipulation & Cycle Finding",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "reverse-linked-list",
                                "name": "Iterative & Recursive Linked List Reversal",
                                "difficulty": "EASY",
                                "learning_objectives": ["Manipulate next pointers in-place with prev/curr/next temporaries", "Maintain O(1) auxiliary space"],
                                "common_patterns": ["Three-pointer swap (prev, curr, temp)"],
                                "common_mistakes": ["Losing pointer reference to rest of the list before redirecting next pointer", "Null pointer dereference at head"],
                                "practice_resources": [
                                    {"title": "Reverse Linked List", "url": "https://leetcode.com/problems/reverse-linked-list/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "floyd-cycle-detection",
                                "name": "Floyd's Tortoise & Hare Cycle Finding",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Prove fast pointer (2 steps) meets slow pointer (1 step) if cycle exists", "Find the starting node of the cycle in O(N) time and O(1) space"],
                                "common_patterns": ["Slow and Fast Pointers (2x speed difference)"],
                                "common_mistakes": ["Not checking fast.next != null before accessing fast.next.next"],
                                "practice_resources": [
                                    {"title": "Linked List Cycle II", "url": "https://leetcode.com/problems/linked-list-cycle-ii/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "merge-k-sorted-lists",
                                "name": "Merge K Sorted Linked Lists",
                                "difficulty": "HARD",
                                "learning_objectives": ["Use Min-Heap of size K or Divide & Conquer to merge K lists in O(N log K) time", "Maintain constant pointer overhead"],
                                "common_patterns": ["Min-Heap of list heads", "Divide and Conquer pairwise merge"],
                                "common_mistakes": ["Comparing entire lists repeatedly resulting in O(N * K) worst case"],
                                "practice_resources": [
                                    {"title": "Merge k Sorted Lists", "url": "https://leetcode.com/problems/merge-k-sorted-lists/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "stacks",
                "name": "Stacks & Monotonic Stacks",
                "description": "LIFO execution buffers, parenthesis matching, expression evaluation, and monotonic stacks.",
                "order": 4,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays", "linked-lists"],
                "subtopics": [
                    {
                        "slug": "monotonic-stack-subtopic",
                        "name": "Monotonic Stack Applications",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "valid-parentheses",
                                "name": "Matching Parentheses & Bracket Validation",
                                "difficulty": "EASY",
                                "learning_objectives": ["Verify matching open and close delimiters with stack", "Detect unbalanced strings in O(N)"],
                                "common_patterns": ["Hashmap lookup for closing delimiters"],
                                "common_mistakes": ["Popping from empty stack when string begins with closing bracket", "Not checking stack is empty at end"],
                                "practice_resources": [
                                    {"title": "Valid Parentheses", "url": "https://leetcode.com/problems/valid-parentheses/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "next-greater-element",
                                "name": "Next Greater Element via Monotonic Decreasing Stack",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Maintain strictly decreasing stack to find next greater element in O(N) overall time", "Track indices on stack"],
                                "common_patterns": ["Monotonic Decreasing Stack"],
                                "common_mistakes": ["Popping values instead of indices when distances are needed", "Re-evaluating nested loops O(N^2)"],
                                "practice_resources": [
                                    {"title": "Daily Temperatures", "url": "https://leetcode.com/problems/daily-temperatures/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "largest-rectangle-histogram",
                                "name": "Largest Rectangle in Histogram",
                                "difficulty": "HARD",
                                "learning_objectives": ["Calculate maximum rectangle area in O(N) using monotonic increasing stack", "Identify left and right lower limits for each bar"],
                                "common_patterns": ["Monotonic Stack with Sentinel Padding"],
                                "common_mistakes": ["Failing to pop remaining bars after scanning entire array"],
                                "practice_resources": [
                                    {"title": "Largest Rectangle in Histogram", "url": "https://leetcode.com/problems/largest-rectangle-in-histogram/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "queues",
                "name": "Queues, Deques & Monotonic Deques",
                "description": "FIFO buffers, double-ended queues, and sliding window maximums using monotonic deques.",
                "order": 5,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["arrays", "linked-lists"],
                "subtopics": [
                    {
                        "slug": "deque-sliding-window",
                        "name": "Sliding Window Maximum & Double-Ended Queues",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "queue-using-stacks",
                                "name": "Implement Queue using Stacks",
                                "difficulty": "EASY",
                                "learning_objectives": ["Amortized O(1) queue operations using two stacks (inbox and outbox)"],
                                "common_patterns": ["Two-stack reversal transfer"],
                                "common_mistakes": ["Transferring elements back and forth on every push/pop"],
                                "practice_resources": [
                                    {"title": "Implement Queue using Stacks", "url": "https://leetcode.com/problems/implement-queue-using-stacks/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "sliding-window-maximum",
                                "name": "Sliding Window Maximum (Monotonic Deque)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Maintain monotonically decreasing deque storing indices", "Evict elements out of window range from front in O(1)", "Evict smaller elements from back in O(1)"],
                                "common_patterns": ["Monotonic Decreasing Deque"],
                                "common_mistakes": ["Storing values instead of indices making window boundary eviction impossible"],
                                "practice_resources": [
                                    {"title": "Sliding Window Maximum", "url": "https://leetcode.com/problems/sliding-window-maximum/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "hash-tables",
                "name": "Hash Tables & Hash Sets",
                "description": "Hash functions, collision resolution (chaining vs open addressing), load factors, and constant-time lookups.",
                "order": 6,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays"],
                "subtopics": [
                    {
                        "slug": "hash-mechanisms",
                        "name": "Collision Handling & Design",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "two-sum",
                                "name": "Two Sum (Complement Hash Map)",
                                "difficulty": "EASY",
                                "learning_objectives": ["Single-pass O(N) search for target - x complement in hash map"],
                                "common_patterns": ["Complement Lookup Map"],
                                "common_mistakes": ["Using same element twice by adding to map before checking complement"],
                                "practice_resources": [
                                    {"title": "Two Sum", "url": "https://leetcode.com/problems/two-sum/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "lru-cache",
                                "name": "LRU Cache Design (Hash Map + Doubly Linked List)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Design O(1) get and put operations", "Combine doubly linked list for node ordering with hash map for pointer lookup"],
                                "common_patterns": ["Hash Map with Doubly Linked Sentinel Nodes"],
                                "common_mistakes": ["Not updating node position to head on get() read access", "Failing to remove deleted node from hash map"],
                                "practice_resources": [
                                    {"title": "LRU Cache", "url": "https://leetcode.com/problems/lru-cache/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "algorithmic-paradigms",
        "name": "Algorithmic Paradigms & Techniques",
        "description": "Two pointers, binary search, sorting, divide & conquer, backtracking, and greedy strategies.",
        "order": 2,
        "topics": [
            {
                "slug": "two-pointers",
                "name": "Two Pointers & Two-Sum Patterns",
                "description": "Opposite ends, fast/slow pointer pairs, palindrome verification, and water containment.",
                "order": 7,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays"],
                "subtopics": [
                    {
                        "slug": "two-pointers-patterns",
                        "name": "Colliding & Parallel Pointers",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "valid-palindrome",
                                "name": "Valid Palindrome (Inward Pointers)",
                                "difficulty": "EASY",
                                "learning_objectives": ["Traverse string from left and right boundaries converging to center in O(N)"],
                                "common_patterns": ["Opposite Ends Colliding Pointers"],
                                "common_mistakes": ["Not skipping non-alphanumeric chars properly before equality check"],
                                "practice_resources": [
                                    {"title": "Valid Palindrome", "url": "https://leetcode.com/problems/valid-palindrome/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "container-with-most-water",
                                "name": "Container With Most Water",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Greedily move the pointer with the smaller height inward to seek higher area", "Prove correctness of skipping lesser heights"],
                                "common_patterns": ["Greedy Colliding Two Pointers"],
                                "common_mistakes": ["Moving both pointers inward or moving taller pointer"],
                                "practice_resources": [
                                    {"title": "Container With Most Water", "url": "https://leetcode.com/problems/container-with-most-water/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "trapping-rain-water",
                                "name": "Trapping Rain Water (Two Pointers / Prefix Max)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Track left_max and right_max bounds to accumulate trapped water in O(N) time and O(1) space"],
                                "common_patterns": ["Two Pointers with Running Bound Extrema"],
                                "common_mistakes": ["Using O(N) space arrays when two pointers can achieve O(1) space"],
                                "practice_resources": [
                                    {"title": "Trapping Rain Water", "url": "https://leetcode.com/problems/trapping-rain-water/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "sliding-window",
                "name": "Sliding Window Technique",
                "description": "Dynamic expansion and contraction of subarray/substring windows.",
                "order": 8,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays", "two-pointers"],
                "subtopics": [
                    {
                        "slug": "window-mechanisms",
                        "name": "Variable & Fixed Window Optimization",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "longest-substring-without-repeating",
                                "name": "Longest Substring Without Repeating Characters",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Maintain window of unique chars using hash set or last-seen index map", "Expand right pointer, contract left pointer upon duplicate"],
                                "common_patterns": ["Dynamic Expanding & Contracting Window"],
                                "common_mistakes": ["Moving left pointer backward when jumping to duplicate + 1 (must use max(left, last_idx + 1))"],
                                "practice_resources": [
                                    {"title": "Longest Substring Without Repeating Characters", "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "minimum-window-substring",
                                "name": "Minimum Window Substring",
                                "difficulty": "HARD",
                                "learning_objectives": ["Track required characters matched count in O(N) time", "Contract left pointer while all characters of target pattern are satisfied"],
                                "common_patterns": ["Two-condition sliding window with match counter"],
                                "common_mistakes": ["Checking map equality in loop O(26) instead of keeping integer match count O(1)"],
                                "practice_resources": [
                                    {"title": "Minimum Window Substring", "url": "https://leetcode.com/problems/minimum-window-substring/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "binary-search",
                "name": "Binary Search & Search Space Reduction",
                "description": "Logarithmic search, predicate monotonicity, binary search on answers, and rotated sorted arrays.",
                "order": 9,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays"],
                "subtopics": [
                    {
                        "slug": "search-space-reduction",
                        "name": "Binary Search on Value Space",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "binary-search-basic",
                                "name": "Standard Binary Search & Lower Bound",
                                "difficulty": "EASY",
                                "learning_objectives": ["Implement bug-free binary search using low + (high - low) // 2", "Handle edge elements and insertion point"],
                                "common_patterns": ["Interval Halving [low, mid - 1] / [mid + 1, high]"],
                                "common_mistakes": ["Integer overflow with (low + high) // 2 in languages with bounded ints", "Infinite loop when low <= high boundary is malformed"],
                                "practice_resources": [
                                    {"title": "Binary Search", "url": "https://leetcode.com/problems/binary-search/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "search-rotated-sorted-array",
                                "name": "Search in Rotated Sorted Array",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Identify which half of the array is strictly sorted (left or right)", "Determine whether target falls in sorted half in O(log N)"],
                                "common_patterns": ["Rotated Invariant Inspection"],
                                "common_mistakes": ["Failing to handle duplicate values without linear fallback"],
                                "practice_resources": [
                                    {"title": "Search in Rotated Sorted Array", "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "koko-eating-bananas",
                                "name": "Binary Search on Answer (Monotonic Predicate)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Formulate boolean verification function is_valid(speed)", "Find minimal valid threshold across search space [1, max_val]"],
                                "common_patterns": ["Binary Search over Feasibility Function"],
                                "common_mistakes": ["Incorrect ceiling division in feasibility checks"],
                                "practice_resources": [
                                    {"title": "Koko Eating Bananas", "url": "https://leetcode.com/problems/koko-eating-bananas/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "median-two-sorted-arrays",
                                "name": "Median of Two Sorted Arrays",
                                "difficulty": "HARD",
                                "learning_objectives": ["Partition both arrays simultaneously such that left halves equal right halves", "Achieve O(log(min(N, M))) complexity"],
                                "common_patterns": ["Dual-Array Partition Binary Search"],
                                "common_mistakes": ["Not searching on the smaller array first, leading to index out of bounds"],
                                "practice_resources": [
                                    {"title": "Median of Two Sorted Arrays", "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "sorting",
                "name": "Sorting Algorithms",
                "description": "Comparison vs non-comparison sorts: QuickSort, MergeSort, HeapSort, and Counting Sort.",
                "order": 10,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["arrays"],
                "subtopics": [
                    {
                        "slug": "divide-and-conquer-sorts",
                        "name": "MergeSort & QuickSort Invariants",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "merge-sort",
                                "name": "Merge Sort & Count Inversions",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Implement stable divide-and-conquer sorting in O(N log N)", "Count array inversions during merge phase"],
                                "common_patterns": ["Divide and Conquer with Two-Way Merge"],
                                "common_mistakes": ["Excessive memory allocations in recursion without reusable scratch buffer"],
                                "practice_resources": [
                                    {"title": "Sort an Array (MergeSort)", "url": "https://leetcode.com/problems/sort-an-array/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "quick-select",
                                "name": "Quickselect (Kth Largest Element in O(N) Average)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Partition array around pivot to find Kth order statistic without full sort", "Understand worst case O(N^2) vs randomized O(N)"],
                                "common_patterns": ["Lomuto / Hoare Partition with Random Pivot"],
                                "common_mistakes": ["Deterministic pivot leading to TLE on sorted inputs"],
                                "practice_resources": [
                                    {"title": "Kth Largest Element in an Array", "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "recursion",
                "name": "Recursion Fundamentals",
                "description": "Call stack frames, base cases, recurrence relations, and tree recursion.",
                "order": 11,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": [],
                "subtopics": [
                    {
                        "slug": "recursion-mechanics",
                        "name": "Recurrence & Call Stack Trees",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "pow-x-n",
                                "name": "Fast Exponentiation (Pow(x, n))",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Compute x^n in O(log N) using binary exponentiation", "Handle negative exponents and odd powers"],
                                "common_patterns": ["Binary Exponentiation (x^(n/2))^2"],
                                "common_mistakes": ["Integer overflow when n = -2^31 in 32-bit integers"],
                                "practice_resources": [
                                    {"title": "Pow(x, n)", "url": "https://leetcode.com/problems/powx-n/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "backtracking",
                "name": "Backtracking & State Space Search",
                "description": "Pruning state search trees, combinations, permutations, subset generation, and constraint satisfaction.",
                "order": 12,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["recursion"],
                "subtopics": [
                    {
                        "slug": "combinatorial-search",
                        "name": "Subsets, Permutations & Pruning",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "subsets",
                                "name": "Generate All Subsets (Power Set)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Build binary decision tree (include/exclude) generating 2^N subsets", "Pass current path by reference and backtrack with pop()"],
                                "common_patterns": ["Include / Exclude Choice Tree", "Backtracking undo pop()"],
                                "common_mistakes": ["Appending mutable list reference instead of shallow copy `list(path)` to results"],
                                "practice_resources": [
                                    {"title": "Subsets", "url": "https://leetcode.com/problems/subsets/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "n-queens",
                                "name": "N-Queens Constraint Satisfaction",
                                "difficulty": "HARD",
                                "learning_objectives": ["Place N non-attacking queens on N*N board", "Prune column and diagonal conflicts in O(1) using sets"],
                                "common_patterns": ["Diagonal hashing (row - col, row + col)"],
                                "common_mistakes": ["Checking board cells iteratively instead of using O(1) set membership for diagonals"],
                                "practice_resources": [
                                    {"title": "N-Queens", "url": "https://leetcode.com/problems/n-queens/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "trees-and-hierarchical-structures",
        "name": "Trees & Hierarchical Structures",
        "description": "Binary trees, search trees, heaps, tries, and balanced structures.",
        "order": 3,
        "topics": [
            {
                "slug": "binary-trees",
                "name": "Binary Trees & Tree Traversals",
                "description": "Inorder, Preorder, Postorder, Level-Order (BFS), tree diameter, and Lowest Common Ancestor (LCA).",
                "order": 13,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["recursion", "queues"],
                "subtopics": [
                    {
                        "slug": "tree-traversal-patterns",
                        "name": "DFS & BFS Traversal Mechanics",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "maximum-depth-binary-tree",
                                "name": "Maximum Depth of Binary Tree",
                                "difficulty": "EASY",
                                "learning_objectives": ["Compute tree height via postorder depth recursion 1 + max(left, right)"],
                                "common_patterns": ["Postorder Bottom-Up Aggregation"],
                                "common_mistakes": ["Missing base case when root is None returning 0"],
                                "practice_resources": [
                                    {"title": "Maximum Depth of Binary Tree", "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "lowest-common-ancestor-binary-tree",
                                "name": "Lowest Common Ancestor (LCA) in Binary Tree",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Traverse subtrees recursively to locate nodes P and Q in O(N) time", "Return common ancestor node when left and right branches both return non-null"],
                                "common_patterns": ["Bottom-up subtree signal propagation"],
                                "common_mistakes": ["Assuming BST ordering properties in general binary trees"],
                                "practice_resources": [
                                    {"title": "Lowest Common Ancestor of a Binary Tree", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "binary-tree-maximum-path-sum",
                                "name": "Binary Tree Maximum Path Sum",
                                "difficulty": "HARD",
                                "learning_objectives": ["Compute global maximum path across any two nodes while returning single-branch gain up the recursion tree", "Handle negative node contributions by clamping at zero"],
                                "common_patterns": ["Global state accumulator with constrained return value"],
                                "common_mistakes": ["Allowing negative branch values to diminish the root value instead of taking max(gain, 0)"],
                                "practice_resources": [
                                    {"title": "Binary Tree Maximum Path Sum", "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "binary-search-trees",
                "name": "Binary Search Trees (BST & Self-Balancing)",
                "description": "BST ordering invariants, inorder traversal sortedness, search/insert/delete, and AVL/Red-Black balances.",
                "order": 14,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["binary-trees"],
                "subtopics": [
                    {
                        "slug": "bst-properties",
                        "name": "BST Invariant & Validation",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "validate-bst",
                                "name": "Validate Binary Search Tree",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Verify all nodes satisfy lower < node.val < upper bounds globally, not just locally", "Use inorder traversal monotonicity"],
                                "common_patterns": ["Bounded Recursion (min_val, max_val)"],
                                "common_mistakes": ["Checking only immediate child nodes (left < root < right) while violating grandparent bounds"],
                                "practice_resources": [
                                    {"title": "Validate Binary Search Tree", "url": "https://leetcode.com/problems/validate-binary-search-tree/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "heaps",
                "name": "Heaps & Priority Queues",
                "description": "Complete binary trees, heapify algorithm, min/max heaps, and top-K elements.",
                "order": 15,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays", "binary-trees"],
                "subtopics": [
                    {
                        "slug": "heap-applications",
                        "name": "Priority Queues & Stream Top-K",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "find-median-from-data-stream",
                                "name": "Find Median from Data Stream (Two Heaps)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Balance max-heap (lower half) and min-heap (upper half) to retrieve median in O(1) time and insert in O(log N)"],
                                "common_patterns": ["Two Heaps (Smallers Max-Heap, Largers Min-Heap)"],
                                "common_mistakes": ["Allowing size difference between the two heaps to exceed 1"],
                                "practice_resources": [
                                    {"title": "Find Median from Data Stream", "url": "https://leetcode.com/problems/find-median-from-data-stream/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "tries",
                "name": "Tries & Suffix Trees",
                "description": "Prefix tree nodes, alphabet pointers, autocomplete, and bitwise XOR tries.",
                "order": 16,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["strings", "hash-tables"],
                "subtopics": [
                    {
                        "slug": "prefix-tree-design",
                        "name": "Prefix Matching & Word Search",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "implement-trie",
                                "name": "Implement Trie (Prefix Tree)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Construct TrieNode with children pointers and is_end_of_word flag", "Implement insert, search, and startsWith in O(L) time"],
                                "common_patterns": ["Trie Node Structure with Array or Map Children"],
                                "common_mistakes": ["Confusing whole word lookup with prefix lookup"],
                                "practice_resources": [
                                    {"title": "Implement Trie (Prefix Tree)", "url": "https://leetcode.com/problems/implement-trie-prefix-tree/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "disjoint-set-union",
                "name": "Disjoint Set Union (DSU / Union-Find)",
                "description": "Connected component tracking, path compression, and union by rank/size.",
                "order": 17,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["arrays", "recursion"],
                "subtopics": [
                    {
                        "slug": "dsu-algorithms",
                        "name": "Path Compression & Cycle Detection",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "redundant-connection",
                                "name": "Redundant Connection (Cycle in Undirected Graph)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Identify cycle in undirected graph using Disjoint Set Union in near O(1) amortized alpha time", "Apply path compression during find()"],
                                "common_patterns": ["Union by Rank with Path Compression"],
                                "common_mistakes": ["Omitting path compression parent[x] = find(parent[x]) degrading performance to O(N)"],
                                "practice_resources": [
                                    {"title": "Redundant Connection", "url": "https://leetcode.com/problems/redundant-connection/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "graph-algorithms",
        "name": "Graph Algorithms & Networks",
        "description": "Graph traversals, shortest path trees, DAG topological sorting, and spanning trees.",
        "order": 4,
        "topics": [
            {
                "slug": "graphs",
                "name": "Graph Representations & Traversals (BFS/DFS)",
                "description": "Adjacency lists/matrices, BFS shortest path on unweighted graphs, and connected components.",
                "order": 18,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["queues", "stacks", "hash-tables"],
                "subtopics": [
                    {
                        "slug": "graph-traversals",
                        "name": "BFS Level Order & DFS Island Counting",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "number-of-islands",
                                "name": "Number of Islands (Grid BFS/DFS)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Flood-fill 2D grid matrix using DFS/BFS", "Mark visited cells in-place or via visited set to avoid infinite cycles"],
                                "common_patterns": ["2D Grid Direction Vectors [(0,1), (0,-1), (1,0), (-1,0)]"],
                                "common_mistakes": ["Boundary checks out of matrix range", "Adding cell to queue in BFS without immediately marking it visited, causing queue explosion"],
                                "practice_resources": [
                                    {"title": "Number of Islands", "url": "https://leetcode.com/problems/number-of-islands/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "word-ladder",
                                "name": "Word Ladder (Shortest Path BFS)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Model state transformations as unweighted graph edges", "Apply Bidirectional BFS to find shortest path transformation length"],
                                "common_patterns": ["Bidirectional BFS on Word Transformation States"],
                                "common_mistakes": ["Checking all dictionary words O(N) instead of generating 26 character variations O(26 * L)"],
                                "practice_resources": [
                                    {"title": "Word Ladder", "url": "https://leetcode.com/problems/word-ladder/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "topological-sort",
                "name": "Topological Sorting & DAGs",
                "description": "Kahn's in-degree queue algorithm and DFS finishing times for dependency ordering.",
                "order": 19,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["graphs"],
                "subtopics": [
                    {
                        "slug": "dependency-scheduling",
                        "name": "Course Schedule & Cycle Detection",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "course-schedule",
                                "name": "Course Schedule (Cycle Detection in Directed Graph)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Detect cycles in directed graph using Kahn's in-degree BFS or 3-color DFS (unvisited, visiting, visited)", "Order courses satisfying prerequisites"],
                                "common_patterns": ["Kahn's Algorithm (In-Degree Array + Queue)"],
                                "common_mistakes": ["Using simple 2-state visited set for directed graph cycles (requires 3-state tracking)"],
                                "practice_resources": [
                                    {"title": "Course Schedule", "url": "https://leetcode.com/problems/course-schedule/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "shortest-paths",
                "name": "Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall)",
                "description": "Greedy priority queue relaxation, negative edge weight detection, and all-pairs shortest distances.",
                "order": 20,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["graphs", "heaps"],
                "subtopics": [
                    {
                        "slug": "weighted-shortest-paths",
                        "name": "Dijkstra & Relaxation Algorithms",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "network-delay-time",
                                "name": "Network Delay Time (Dijkstra's Algorithm)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Compute single-source shortest path on positive weighted graphs using min-heap priority queue in O(E log V)"],
                                "common_patterns": ["Dijkstra Priority Queue with Distance Relaxation"],
                                "common_mistakes": ["Applying Dijkstra to graphs with negative weight edges", "Not skipping stale queue pairs when current distance > dist[node]"],
                                "practice_resources": [
                                    {"title": "Network Delay Time", "url": "https://leetcode.com/problems/network-delay-time/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "minimum-spanning-trees",
                "name": "Minimum Spanning Trees (Kruskal & Prim)",
                "description": "Greedy edge selection, cycle prevention using DSU, and cut property.",
                "order": 21,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["graphs", "disjoint-set-union", "heaps"],
                "subtopics": [
                    {
                        "slug": "mst-algorithms",
                        "name": "Kruskal & Prim Construction",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "min-cost-connect-points",
                                "name": "Min Cost to Connect All Points (Kruskal / Prim)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Build MST across coordinate points using Prim's priority queue algorithm or Kruskal's sorted edges with DSU in O(N^2) or O(E log E)"],
                                "common_patterns": ["Prim's Algorithm with Visited Node Set"],
                                "common_mistakes": ["Generating all O(N^2) edges into memory when Prim's dense optimization is faster"],
                                "practice_resources": [
                                    {"title": "Min Cost to Connect All Points", "url": "https://leetcode.com/problems/min-cost-to-connect-all-points/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "dynamic-programming-and-advanced",
        "name": "Dynamic Programming & Advanced Topics",
        "description": "Optimal substructure, overlapping subproblems, memoization, knapsack, and interval trees.",
        "order": 5,
        "topics": [
            {
                "slug": "dp-1d",
                "name": "1D Dynamic Programming",
                "description": "Linear state transitions, Fibonacci, Climbing Stairs, House Robber, and Coin Change.",
                "order": 22,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["recursion"],
                "subtopics": [
                    {
                        "slug": "linear-transitions",
                        "name": "Memoization & Space Optimization",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "climbing-stairs",
                                "name": "Climbing Stairs (Fibonacci Invariant)",
                                "difficulty": "EASY",
                                "learning_objectives": ["Formulate DP recurrence dp[i] = dp[i-1] + dp[i-2]", "Optimize space from O(N) to O(1) using two variables"],
                                "common_patterns": ["1D State Rolling Variables"],
                                "common_mistakes": ["Recomputing overlapping branches recursively leading to O(2^N) exponential time"],
                                "practice_resources": [
                                    {"title": "Climbing Stairs", "url": "https://leetcode.com/problems/climbing-stairs/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "coin-change",
                                "name": "Coin Change (Fewest Coins)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Formulate unbounded knapsack state dp[a] = min(dp[a - c] + 1)", "Initialize array with infinity sentinel"],
                                "common_patterns": ["Unbounded 1D Knapsack Minimum Accumulation"],
                                "common_mistakes": ["Greedy coin pick failing on arbitrary coin denominations (e.g. [1, 3, 4] for amount 6)"],
                                "practice_resources": [
                                    {"title": "Coin Change", "url": "https://leetcode.com/problems/coin-change/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "dp-2d",
                "name": "2D & Grid Dynamic Programming",
                "description": "Grid paths, longest common subsequences, edit distances, and matrix state spaces.",
                "order": 23,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["dp-1d"],
                "subtopics": [
                    {
                        "slug": "grid-paths-subtopic",
                        "name": "Grid Traversal & Subsequence Matrix",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "unique-paths",
                                "name": "Unique Paths in Grid",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Formulate 2D state dp[r][c] = dp[r-1][c] + dp[r][c-1]", "Optimize memory to O(N) single row buffer"],
                                "common_patterns": ["2D Grid Path Accumulation"],
                                "common_mistakes": ["Forgetting to initialize first row and first column to 1"],
                                "practice_resources": [
                                    {"title": "Unique Paths", "url": "https://leetcode.com/problems/unique-paths/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "longest-common-subsequence",
                                "name": "Longest Common Subsequence (LCS)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Compare character matches dp[i][j] = 1 + dp[i-1][j-1] else max(dp[i-1][j], dp[i][j-1]) in O(M*N)"],
                                "common_patterns": ["Two-String Comparison DP Matrix"],
                                "common_mistakes": ["Confusing subsequence (can skip chars) with contiguous substring"],
                                "practice_resources": [
                                    {"title": "Longest Common Subsequence", "url": "https://leetcode.com/problems/longest-common-subsequence/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "edit-distance",
                                "name": "Edit Distance (Levenshtein Distance)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Compute minimum operations (insert, delete, replace) to transform word1 to word2", "Formulate recurrence min(insert, delete, replace) + 1"],
                                "common_patterns": ["3-Way Operation State Transitions"],
                                "common_mistakes": ["Incorrect base cases for empty strings where cost is length of other string"],
                                "practice_resources": [
                                    {"title": "Edit Distance", "url": "https://leetcode.com/problems/edit-distance/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "dp-knapsack",
                "name": "0/1 Knapsack & Partition Subsets",
                "description": "0/1 Knapsack decision branches, target sums, and partition equal subset sums.",
                "order": 24,
                "typical_importance": "VERY_HIGH",
                "prerequisite_topic_slugs": ["dp-1d"],
                "subtopics": [
                    {
                        "slug": "subset-optimization",
                        "name": "0/1 Knapsack & Backward Iteration",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "partition-equal-subset-sum",
                                "name": "Partition Equal Subset Sum (0/1 Knapsack)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Reduce problem to finding subset sum equal to sum(nums) // 2", "Iterate 1D DP backward to ensure each element is used at most once"],
                                "common_patterns": ["1D Knapsack with Reversed Iteration"],
                                "common_mistakes": ["Iterating forward causing element to be reused multiple times like unbounded knapsack"],
                                "practice_resources": [
                                    {"title": "Partition Equal Subset Sum", "url": "https://leetcode.com/problems/partition-equal-subset-sum/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "greedy",
                "name": "Greedy Algorithms",
                "description": "Locally optimal choices, interval scheduling, jump game, and gas stations.",
                "order": 25,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": ["sorting"],
                "subtopics": [
                    {
                        "slug": "greedy-intervals",
                        "name": "Interval Scheduling & Reachability",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "jump-game",
                                "name": "Jump Game (Max Reachable Index)",
                                "difficulty": "MEDIUM",
                                "learning_objectives": ["Track maximum reachable boundary in single O(N) pass without full DP table"],
                                "common_patterns": ["Greedy Max Reach Boundary"],
                                "common_mistakes": ["Iterating past maximum reachable boundary before updating"],
                                "practice_resources": [
                                    {"title": "Jump Game", "url": "https://leetcode.com/problems/jump-game/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "bit-manipulation",
                "name": "Bit Manipulation & Bitmasks",
                "description": "Bitwise AND/OR/XOR, two's complement, bit shifts, and representing subsets as bitmask integers.",
                "order": 26,
                "typical_importance": "HIGH",
                "prerequisite_topic_slugs": [],
                "subtopics": [
                    {
                        "slug": "bit-operations",
                        "name": "XOR Invariants & Bit Clearing",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "single-number",
                                "name": "Single Number (XOR Property)",
                                "difficulty": "EASY",
                                "learning_objectives": ["Leverage x ^ x = 0 and x ^ 0 = x to find unique element in O(N) time and O(1) space"],
                                "common_patterns": ["XOR Self-Inverse Annihilation"],
                                "common_mistakes": ["Using extra hash set when O(1) bitwise XOR exists"],
                                "practice_resources": [
                                    {"title": "Single Number", "url": "https://leetcode.com/problems/single-number/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            },
                            {
                                "slug": "counting-bits",
                                "name": "Counting Set Bits (Brian Kernighan / DP)",
                                "difficulty": "EASY",
                                "learning_objectives": ["Clear least significant set bit using n & (n - 1)", "Compute set bits for all numbers up to N in O(N) using dp[i] = dp[i >> 1] + (i & 1)"],
                                "common_patterns": ["n & (n - 1) Lowest Bit Clear"],
                                "common_mistakes": ["Running O(log N) loop for each integer leading to O(N log N)"],
                                "practice_resources": [
                                    {"title": "Counting Bits", "url": "https://leetcode.com/problems/counting-bits/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "segment-trees",
                "name": "Segment Trees & Binary Indexed Trees (Fenwick)",
                "description": "Dynamic range queries (sum, min, max) and point/range updates in O(log N).",
                "order": 27,
                "typical_importance": "MEDIUM",
                "prerequisite_topic_slugs": ["binary-trees", "arrays"],
                "subtopics": [
                    {
                        "slug": "range-query-trees",
                        "name": "Range Sum & Point Update",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "range-sum-query-mutable",
                                "name": "Range Sum Query Mutable (Binary Indexed Tree / Fenwick)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Implement Fenwick Tree (BIT) with lowbit i & (-i) index navigation in O(log N)", "Achieve O(log N) point update and range query"],
                                "common_patterns": ["Fenwick Tree (BIT) lowbit indexing"],
                                "common_mistakes": ["1-indexed array alignment errors in BIT"],
                                "practice_resources": [
                                    {"title": "Range Sum Query - Mutable", "url": "https://leetcode.com/problems/range-sum-query-mutable/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "string-algorithms-advanced",
                "name": "Advanced String Matching (KMP & Rabin-Karp)",
                "description": "Knuth-Morris-Pratt (KMP) prefix-function, rolling hash Rabin-Karp, and linear string matching.",
                "order": 28,
                "typical_importance": "MEDIUM",
                "prerequisite_topic_slugs": ["strings"],
                "subtopics": [
                    {
                        "slug": "exact-pattern-matching",
                        "name": "KMP Prefix Function (LPS Array)",
                        "order": 1,
                        "concepts": [
                            {
                                "slug": "kmp-algorithm",
                                "name": "KMP Algorithm (Longest Proper Prefix which is also Suffix)",
                                "difficulty": "HARD",
                                "learning_objectives": ["Build LPS array in O(M) time", "Match pattern in text in O(N) time without backtracking text pointer"],
                                "common_patterns": ["LPS Array Failure Function"],
                                "common_mistakes": ["Backtracking text index on mismatch instead of consulting LPS array"],
                                "practice_resources": [
                                    {"title": "Find the Index of the First Occurrence in a String", "url": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", "type": "PRACTICE_PROBLEM", "is_free": True, "platform": "LeetCode"}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

def get_dsa_catalog():
    return DSA_CATALOG
