// Reusable analytics calculations or chart datasets formatters.
export function formatWeeklyProgressData(logs: Record<string, any>, currentDay: number): { name: string; completed: number }[] {
  const dataset = [];
  for (let i = 6; i >= 0; i--) {
    const d = currentDay - i;
    if (d < 1) {
      dataset.push({ name: `Day ${d}`, completed: 0 });
    } else {
      const l = logs[d];
      dataset.push({
        name: `Day ${d}`,
        completed: l?.status === 'completed' ? 100 : (l?.status === 'partial' ? 50 : 0)
      });
    }
  }
  return dataset;
}
