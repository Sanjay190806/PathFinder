export const DEMO_PORTFOLIO = {
  hero: {
    name: 'Sanju Career OS',
    subtitle: 'A local-first career operating system for placement prep, German practice, and AI mentoring.',
    pitch: 'Showcase the engineering behind the tracker without exposing personal data.',
  },
  metrics: [
    { label: 'Placement readiness', value: '89%', detail: 'Composite demo score' },
    { label: 'AI provider coverage', value: '7', detail: 'Groq, OpenRouter, local, and more' },
    { label: 'German academy', value: '30', detail: 'Lessons modeled in the demo' },
    { label: 'Showcase projects', value: '3', detail: 'Portfolio-safe examples' },
  ],
  architecture: [
    { title: 'Frontend shell', detail: 'React, Vite, Zustand, responsive layout system.' },
    { title: 'Backend router', detail: 'Express API with AI provider abstraction and fallbacks.' },
    { title: 'Safety layer', detail: 'Redaction, demo data, and local-first persistence.' },
    { title: 'AI systems', detail: 'Shayla mentor, German coach, interview coach, and coding mentor.' },
  ],
  projects: [
    {
      name: 'CareSync AI',
      stack: ['React', 'FastAPI', 'PyTorch'],
      summary: 'Healthcare coordinator demo focused on routing and explainability.',
      impact: 'Turns healthcare workflows into a guided AI workspace.',
    },
    {
      name: 'SmartEdu AI',
      stack: ['React', 'Python', 'XGBoost'],
      summary: 'Student success analytics demo with interpretable forecasting.',
      impact: 'Shows product thinking plus measurable outcomes.',
    },
    {
      name: 'Sanju Career OS',
      stack: ['React', 'Node', 'Prisma', 'Groq', 'Ollama'],
      summary: 'Placement operating system with mentors, trackers, and dashboards.',
      impact: 'Demonstrates system design across the full stack.',
    },
  ],
  aiChat: [
    { role: 'assistant', content: 'Welcome to the demo. I can explain the architecture, the AI router, or the German academy.' },
    { role: 'user', content: 'How do you keep the product recruiter-safe?' },
    { role: 'assistant', content: 'By using demo mode, redaction, and safe showcase data. Private notes and sensitive fields never appear on the portfolio route.' },
  ],
  germanDemo: {
    level: 'A1 to A2',
    summary: 'Lesson paths, speaking prompts, listening drills, stories, and review queues are shown through synthetic examples.',
  },
  analyticsDemo: [
    { label: 'Daily streak', value: '12 days' },
    { label: 'Resume score', value: '86%' },
    { label: 'German speaking minutes', value: '48 min' },
    { label: 'Projects deployed', value: '2' },
  ],
  achievements: [
    'Built a provider-agnostic AI router',
    'Designed a recruiter-safe portfolio mode',
    'Added a German academy with speaking and listening practice',
  ],
  techStack: ['React', 'TypeScript', 'Tailwind', 'Zustand', 'Express', 'Prisma', 'Groq', 'OpenRouter', 'Ollama'],
  videoScript: [
    'Open the portfolio route in demo mode.',
    'Walk through the architecture and provider router.',
    'Show the German academy, Shayla, and project showcases.',
    'Finish with the GitHub CTA and local-first privacy story.',
  ],
  githubUrl: 'https://github.com/sanju/sanju-career-os',
};
