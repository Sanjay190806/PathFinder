export interface RoadmapProblem {
  topic: string;
  pattern: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  number: number;
  url: string;
}

export type RoadmapDay = RoadmapProblem;
