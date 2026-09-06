import { useMemo, useState } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { buildAnalyticsDashboard } from '../services/analyticsService';
import { AnalyticsTimeRange } from '../types/analytics';

export function useAnalytics() {
  const careerState = useCareerStore((state) => state);
  const [range, setRange] = useState<AnalyticsTimeRange>('30d');
  const dashboard = useMemo(() => buildAnalyticsDashboard(careerState, range), [careerState, range]);
  return { dashboard, range, setRange };
}
