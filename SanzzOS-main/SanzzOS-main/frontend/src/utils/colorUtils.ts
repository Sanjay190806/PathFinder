import { TOPIC_COLORS } from '../data/topicColors';

export function getTopicColor(topic: string): string {
  return TOPIC_COLORS[topic] || '#3B82F6';
}

export function getDifficultyColor(diff: 'Easy' | 'Medium' | 'Hard'): string {
  if (diff === 'Easy') return '#10B981';
  if (diff === 'Medium') return '#EAB308';
  return '#EF4444';
}
