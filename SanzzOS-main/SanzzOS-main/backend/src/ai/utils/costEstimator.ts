export interface CostProfile {
  inputCostPer1K: number;
  outputCostPer1K: number;
}

export function estimateCost(inputTokens: number, outputTokens: number, profile: CostProfile): number {
  const inputCost = (inputTokens / 1000) * profile.inputCostPer1K;
  const outputCost = (outputTokens / 1000) * profile.outputCostPer1K;
  return Number((inputCost + outputCost).toFixed(6));
}
