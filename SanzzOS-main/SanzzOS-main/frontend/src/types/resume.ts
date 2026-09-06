export interface ResumeSections {
  contact: number;
  education: number;
  skills: number;
  projects: number;
  achievements: number;
  formatting: number;
}

export interface ResumeProfile {
  version: string;
  atsScore: number;
  lastUpdated: string | null;
  targetRole: string;
  sections: ResumeSections;
}
