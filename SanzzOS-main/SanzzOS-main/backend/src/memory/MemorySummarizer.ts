export interface StateSummary {
  currentDay: number;
  focusTopic: string;
  dsaSolved: string;
  germanLevel: string;
  germanStreak: number;
  germanXp: number;
  resumeScore: number;
  moodTrend: string;
  nextInterview: string;
}

export class MemorySummarizer {
  static summarizeState(ctx: any): string {
    const currentDay = ctx.currentDay || 1;
    const focusTopic = ctx.currentTopic || 'Revision';
    const leetcodeSolved = ctx.leetcodeSolved || 0;
    
    // German
    const germanLevel = ctx.germanLevel || 'A1 Beginner';
    const germanStreak = ctx.germanStreak || 0;
    const germanXP = ctx.germanXP || 0;

    // Resume
    const resumeScore = ctx.resumeScore || 0;

    // Mood
    const mood = ctx.mood !== undefined ? ctx.mood : 3; // 1-5
    const energy = ctx.energy !== undefined ? ctx.energy : 3;
    const distractions = ctx.distractions !== undefined ? ctx.distractions : 3;

    // Applications & Interview
    let nextInterview = 'None scheduled';
    if (ctx.applicationsPipeline) {
      const pipe = ctx.applicationsPipeline;
      if (pipe.interview && pipe.interview.length > 0) {
        nextInterview = Array.isArray(pipe.interview) ? pipe.interview.join(', ') : String(pipe.interview);
      }
    }

    // Mood trend description
    let moodDesc = 'Normal';
    if (mood >= 4 && energy >= 4) moodDesc = 'High Energy / Positive';
    else if (mood <= 2 && distractions >= 4) moodDesc = 'Stressed / Distracted';
    else if (mood <= 2 && energy <= 2) moodDesc = 'Fatigued / Low Motivation';

    return `Current Day: ${currentDay}/180
Focus Topic: ${focusTopic}
DSA Tracker: ${leetcodeSolved}/360 solved
German Path: ${germanLevel} (Streak: ${germanStreak}d, XP: ${germanXP})
ATS Score: ${resumeScore}%
Mood Profile: ${moodDesc} (Energy: ${energy}/5, Distractions: ${distractions}/5)
Next Interview Target: ${nextInterview}`;
  }
}
