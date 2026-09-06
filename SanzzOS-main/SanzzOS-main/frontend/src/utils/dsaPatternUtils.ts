
export const DSA_PATTERNS = [
  'Array Traversal',
  'Prefix Sum',
  'Two Pointers',
  'Sliding Window',
  'HashMap / Frequency',
  'Sorting',
  'Stack',
  'Queue / BFS',
  'Recursion',
  'Backtracking',
  'Binary Search',
  'Binary Search on Answer',
  'Linked List',
  'Trees DFS',
  'Trees BFS',
  'Heap / Priority Queue',
  'Graph DFS',
  'Graph BFS',
  'Dynamic Programming',
  'Greedy',
  'Intervals',
  'Matrix',
  'Bit Manipulation',
];

export function normalizePatternName(value: unknown): string {
  if (!value || typeof value !== 'string') return 'Uncategorized';
  const val = value.trim().toLowerCase();

  if (val.includes('traversal')) return 'Array Traversal';
  if (val.includes('prefix sum')) return 'Prefix Sum';
  if (val.includes('two pointers') || val.includes('fast-slow')) return 'Two Pointers';
  if (val.includes('sliding window') || val.includes('window')) return 'Sliding Window';
  
  if (
    val.includes('hashmap') ||
    val.includes('hashing') ||
    val.includes('frequency') ||
    val.includes('counting')
  ) {
    return 'HashMap / Frequency';
  }
  
  if (val.includes('sorting')) return 'Sorting';
  if (val.includes('stack') || val.includes('monotonic') || val.includes('expression')) return 'Stack';
  if (val.includes('queue') || val.includes('deque')) return 'Queue / BFS';
  if (val.includes('recursion')) return 'Recursion';
  if (val.includes('backtracking') || val.includes('combination') || val.includes('grid')) return 'Backtracking';
  
  if (val.includes('binary search') || val.includes('rotated array') || val.includes('2d')) {
    if (val.includes('on answer')) {
      return 'Binary Search on Answer';
    }
    return 'Binary Search';
  }
  
  if (val.includes('linked list') || val.includes('linkedlist')) return 'Linked List';
  
  if (val.includes('tree') || val.includes('bst')) {
    if (val.includes('bfs') || val.includes('level order')) {
      return 'Trees BFS';
    }
    return 'Trees DFS';
  }
  
  if (val.includes('heap') || val.includes('priority queue') || val.includes('k-way')) return 'Heap / Priority Queue';
  
  if (val.includes('graph')) {
    if (val.includes('bfs') || val.includes('shortest path')) {
      return 'Graph BFS';
    }
    return 'Graph DFS';
  }
  
  if (
    val.includes('dp') ||
    val.includes('dynamic programming') ||
    val.includes('knapsack') ||
    val.includes('subsequence')
  ) {
    return 'Dynamic Programming';
  }
  
  if (val.includes('greedy')) return 'Greedy';
  if (val.includes('interval')) return 'Intervals';
  if (val.includes('matrix')) return 'Matrix';
  if (val.includes('bit')) return 'Bit Manipulation';
  
  if (val.includes('kadane')) return 'Array Traversal';

  return 'Uncategorized';
}

export function getProblemPattern(problem: any): string {
  if (!problem) return 'Uncategorized';
  const pattern = problem.pattern || problem.patternName || 'Uncategorized';
  return normalizePatternName(pattern);
}

export function groupProblemsByPattern(roadmap: Record<string, any[]>) {
  const grouped: Record<string, any[]> = {};
  
  Object.values(roadmap).forEach((problems) => {
    if (Array.isArray(problems)) {
      problems.forEach((p) => {
        const pattern = getProblemPattern(p);
        if (!grouped[pattern]) {
          grouped[pattern] = [];
        }
        grouped[pattern].push(p);
      });
    }
  });

  return grouped;
}

export function calculatePatternStats(patternProblems: any[], state: any) {
  const problemLogs = state.problemLogs || {};
  let totalCount = patternProblems.length;
  let solvedCount = 0;
  let lowConfidenceCount = 0;
  let revisionQueueCount = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  patternProblems.forEach((p) => {
    // Attempt to match key
    const log = problemLogs[p.id] || problemLogs[`d_${p.day}_${p.index}`];
    if (log) {
      if (log.solved) solvedCount++;
      if (log.solved && (log.confidence || 0) <= 2) lowConfidenceCount++;
      if (log.revisitFlag) revisionQueueCount++;
      if (log.confidence) {
        confidenceSum += log.confidence;
        confidenceCount++;
      }
    }
  });

  return {
    totalCount,
    solvedCount,
    lowConfidenceCount,
    revisionQueueCount,
    confidenceAverage: confidenceCount > 0 ? Number((confidenceSum / confidenceCount).toFixed(1)) : 0,
  };
}

export function getPatternMastery(stats: { solvedCount: number; totalCount: number; confidenceAverage: number }): string {
  const ratio = stats.totalCount > 0 ? stats.solvedCount / stats.totalCount : 0;
  if (ratio === 0) return 'Not Started';
  if (ratio < 0.3) return 'Learning';
  if (ratio < 0.6) return 'Practicing';
  if (stats.confidenceAverage >= 4.0) return 'Interview Ready';
  return 'Strong';
}

export function getPatternDifficultyBreakdown(patternProblems: any[]) {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  patternProblems.forEach((p) => {
    const diff = (p.difficulty || '').toLowerCase();
    if (diff === 'easy') easy++;
    else if (diff === 'medium') medium++;
    else if (diff === 'hard') hard++;
  });
  return { easy, medium, hard };
}
