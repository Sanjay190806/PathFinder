export interface ProjectDimensionProgress {
  backend: number;
  frontend: number;
  ai: number;
  testing: number;
  docs: number;
  deploy: number;
}

export interface Project {
  name: string;
  status: 'ideation' | 'building' | 'testing' | 'deployed' | 'archived';
  stack: string[];
  github: string;
  demo: string;
  progress: ProjectDimensionProgress;
  bullets: string[];
  description: string;
}
