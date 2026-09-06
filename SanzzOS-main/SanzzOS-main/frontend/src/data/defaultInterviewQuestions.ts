import { InterviewQuestion } from '../types/mockInterview';

export const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // HR
  {
    id: 'hr-1',
    category: 'HR',
    question: 'Tell me about yourself.',
    notes: 'Keep it structure-focused. Highlight education, core projects, placement goals, and a quick hook.'
  },
  {
    id: 'hr-2',
    category: 'HR',
    question: 'Why should we hire you?',
    notes: 'Connect your placement metrics, DSA solving speed, and technical capabilities to their goals.'
  },
  {
    id: 'hr-3',
    category: 'HR',
    question: 'What are your strengths?',
    notes: 'Show consistency examples (like maintaining study streaks, rapid skill rack completions).'
  },
  {
    id: 'hr-4',
    category: 'HR',
    question: 'What are your weaknesses?',
    notes: 'Mention a real technical area you are actively improving and how (e.g. mock feedback).'
  },
  {
    id: 'hr-5',
    category: 'HR',
    question: 'Tell me about your career goals.',
    notes: 'Focus on scaling code, system architecture, and domain specialization.'
  },
  {
    id: 'hr-6',
    category: 'HR',
    question: 'Why this company?',
    notes: 'Research the business model (product vs service vs analytics) and connect to your interests.'
  },
  {
    id: 'hr-7',
    category: 'HR',
    question: 'Explain a challenge you faced and how you overcame it.',
    notes: 'Use the STAR format (Situation, Task, Action, Result).'
  },
  {
    id: 'hr-8',
    category: 'HR',
    question: 'Tell me about a time you worked in a team.',
    notes: 'Emphasize collaboration, task delegation, and conflict resolution.'
  },
  {
    id: 'hr-9',
    category: 'HR',
    question: 'Where do you see yourself in 5 years?',
    notes: 'Senior engineer, product architect, or tech lead guiding codebase designs.'
  },
  {
    id: 'hr-10',
    category: 'HR',
    question: 'Why did you transition from ECE to software/product/data?',
    notes: 'Focus on coding affinity, software scaling capabilities, and building career tracking systems.'
  },

  // Project Explanation
  {
    id: 'proj-1',
    category: 'Project Explanation',
    question: 'Explain CareSync AI.',
    notes: 'Focus on patient monitoring, priority scoring, and Conceptual Isolation Forest algorithms.'
  },
  {
    id: 'proj-2',
    category: 'Project Explanation',
    question: 'What problem does CareSync AI solve?',
    notes: 'Addresses medical bottlenecks, slow prioritizations, and high triage delay risks.'
  },
  {
    id: 'proj-3',
    category: 'Project Explanation',
    question: 'What was your specific contribution to CareSync AI?',
    notes: 'Discuss building frontend state stores, integrating scoring engines, or model linkages.'
  },
  {
    id: 'proj-4',
    category: 'Project Explanation',
    question: 'What AI/ML algorithm was used and how does it work conceptually?',
    notes: 'Conceptually: Isolation Forest isolates anomalies by randomly partitioning feature spaces.'
  },
  {
    id: 'proj-5',
    category: 'Project Explanation',
    question: 'Explain SmartEdu AI.',
    notes: 'Discuss personalized curriculum, adaptive quizzes, and recommendations.'
  },
  {
    id: 'proj-6',
    category: 'Project Explanation',
    question: 'Explain Sanju Career OS.',
    notes: 'Discuss the local backup engines, PWA capabilities, and adaptive command hubs.'
  },
  {
    id: 'proj-7',
    category: 'Project Explanation',
    question: 'What was the hardest bug you encountered and how did you resolve it?',
    notes: 'Use technical details (e.g. asynchronous state race conditions, DB sync bottlenecks).'
  },

  // Technical
  {
    id: 'tech-1',
    category: 'Technical',
    question: 'Explain Object Oriented Programming (OOPS) concepts.',
    notes: 'Inheritance, Polymorphism, Abstraction, and Encapsulation with real-world examples.'
  },
  {
    id: 'tech-2',
    category: 'Technical',
    question: 'Explain Database Management System (DBMS) basics.',
    notes: 'Normalizations (1NF, 2NF, 3NF), ACID transactions, primary vs foreign keys.'
  },
  {
    id: 'tech-3',
    category: 'Technical',
    question: 'Explain SQL joins with examples.',
    notes: 'Inner, Left, Right, Full, and Self joins.'
  },
  {
    id: 'tech-4',
    category: 'Technical',
    question: 'Explain REST API architectures.',
    notes: 'HTTP verbs (GET, POST, PUT, DELETE), statelessness, status codes (200, 201, 400, 404, 500).'
  },
  {
    id: 'tech-5',
    category: 'Technical',
    question: 'Explain localStorage vs Database persistence.',
    notes: 'Client-side size limit (~5MB), offline-availability vs transactional cloud databases.'
  },

  // Product Thinking & Analytics
  {
    id: 'prod-1',
    category: 'Product Thinking',
    question: 'How do you define success metrics for a dashboard product?',
    notes: 'Daily active usage, task completion rate, retention, load speeds.'
  },
  {
    id: 'prod-2',
    category: 'Product Thinking',
    question: 'What is a user pain point and how do you prioritize resolving it?',
    notes: 'Bottlenecks, layout friction, high clicks. Prioritize using impact vs development cost.'
  }
];
export default DEFAULT_INTERVIEW_QUESTIONS;
