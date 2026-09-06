import { request } from './apiClient';
import { CompactAgentContext, ShaylaBriefingResult } from '../types/shaylaAgent';
import { buildLocalBriefing } from '../utils/dailyBriefingUtils';

type AgentBriefingKind = ShaylaBriefingResult['kind'];

type AgentResponse = {
  briefing?: ShaylaBriefingResult;
  review?: ShaylaBriefingResult;
  generatedAt?: string;
  providerUsed?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
};

export async function generateDailyBriefing(
  briefingType: AgentBriefingKind,
  trackerContext: CompactAgentContext,
  aiSettings: { provider?: string; model?: string; mode?: string; streaming?: boolean }
): Promise<ShaylaBriefingResult> {
  try {
    const response = await request<AgentResponse>('/agent/daily-briefing', {
      method: 'POST',
      body: {
        briefingType,
        trackerContext,
        aiSettings,
      },
    });

    if (response.briefing) return response.briefing;
    if (response.review) return response.review;
  } catch {
    // Local fallback below.
  }

  return buildLocalBriefing(briefingType, trackerContext);
}

export async function generateEveningReview(
  trackerContext: CompactAgentContext,
  aiSettings: { provider?: string; model?: string; mode?: string; streaming?: boolean }
): Promise<ShaylaBriefingResult> {
  try {
    const response = await request<AgentResponse>('/agent/evening-review', {
      method: 'POST',
      body: {
        trackerContext,
        aiSettings,
      },
    });

    if (response.review) return response.review;
    if (response.briefing) return response.briefing;
  } catch {
    // Local fallback below.
  }

  return buildLocalBriefing('evening', trackerContext);
}
