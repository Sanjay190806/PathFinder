import { request } from './apiClient';
import { FeedbackType, FeedbackSeverity } from '../app/store/useFeedbackStore';

export async function submitFeedback(payload: {
  type: FeedbackType;
  title: string;
  description: string;
  severity: FeedbackSeverity;
  page: string;
}) {
  return request<{ ok: boolean; id: string; createdAt: string }>('/feedback', {
    method: 'POST',
    body: payload,
  });
}

