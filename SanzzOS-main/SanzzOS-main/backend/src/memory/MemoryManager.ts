import { MemoryStore, MemoryItem } from './MemoryStore.js';

export class MemoryManager {
  static trackEvent(event: string, data: any): MemoryItem | null {
    let category: MemoryItem['category'] = 'study';
    let content = '';

    switch (event) {
      case 'german_lesson_completed':
        category = 'german';
        content = `Completed German Lesson ${data.order || ''}: "${data.title || ''}". Earned ${data.xpEarned || 30} XP. Objective: ${data.objective || ''}`;
        break;
      case 'german_quiz_completed':
        category = 'german';
        content = `Scored ${data.score}/${data.total} on German Quiz for Lesson ${data.lessonId || ''}.`;
        break;
      case 'streak_milestone':
        category = 'study';
        content = `Reached a German study streak of ${data.streak} days! (Longest streak: ${data.longestStreak} days)`;
        break;
      case 'leetcode_milestone':
        category = 'study';
        content = `Solved LeetCode milestone! Solved count: ${data.solvedCount}/360.`;
        break;
      case 'dsa_topic_weak':
        category = 'study';
        content = `Needs revision on DSA topic: "${data.topic}". Solve time average is high or confidence is low.`;
        break;
      case 'project_milestone':
        category = 'projects';
        content = `Project "${data.name}" progress updated: Backend: ${data.backend}%, Frontend: ${data.frontend}%, AI: ${data.ai}%. Status: ${data.status}`;
        break;
      case 'resume_updated':
        category = 'resume';
        content = `Resume version ${data.version || '1.0'} updated. Target: "${data.targetRole || 'SWE'}". ATS Score: ${data.atsScore}%.`;
        break;
      case 'application_added':
        category = 'applications';
        content = `Added job application for "${data.role}" at ${data.company}. Status: "${data.status}".`;
        break;
      case 'application_status_changed':
        category = 'applications';
        content = `Job application for "${data.role}" at ${data.company} shifted status to "${data.status}".`;
        break;
      case 'burnout_detected':
        category = 'mood';
        content = `Burnout check: Energy levels at ${data.energy}/5, distraction score is high (${data.distractions}/5). Suggesting a lighter review task list.`;
        break;
      case 'mood_logged':
        category = 'mood';
        content = `Logged mood: ${data.mood}/5, Energy: ${data.energy}/5, Distractions: ${data.distractions}/5. Note: "${data.note || 'None'}"`;
        break;
      default:
        return null;
    }

    // Check for duplicate memory content to prevent prompt bloat
    const existing = MemoryStore.getAll();
    const isDuplicate = existing.some((m) => m.content === content && m.category === category);
    if (isDuplicate) return null;

    return MemoryStore.add({ category, content });
  }
}
