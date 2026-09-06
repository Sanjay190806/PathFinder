import { RoadmapProblem } from '../types';
import { ROADMAP } from '../data/roadmap';

export function getProblemDetails(day: number, problemIndex: number): RoadmapProblem | null {
  const dayProbs = ROADMAP[String(day)];
  if (!dayProbs) return null;
  return dayProbs[problemIndex] || null;
}

export function filterRoadmapProblems(
  search: string,
  topic: string,
  difficulty: string,
  solvedStatus: 'all' | 'solved' | 'unsolved',
  solvedProblemKeys: Set<string>
): Record<string, RoadmapProblem[]> {
  const filtered: Record<string, RoadmapProblem[]> = {};

  Object.keys(ROADMAP).forEach(dayKey => {
    const probs = ROADMAP[dayKey] || [];
    const matched = probs.filter((p, idx) => {
      const probKey = `d_${dayKey}_${idx}`;
      const isSolved = solvedProblemKeys.has(probKey);

      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.pattern.toLowerCase().includes(search.toLowerCase());
      const matchTopic = !topic || p.topic === topic;
      const matchDiff = !difficulty || p.difficulty === difficulty;
      const matchStatus = solvedStatus === 'all' || (solvedStatus === 'solved' ? isSolved : !isSolved);

      return matchSearch && matchTopic && matchDiff && matchStatus;
    });

    if (matched.length > 0) {
      filtered[dayKey] = matched;
    }
  });

  return filtered;
}
