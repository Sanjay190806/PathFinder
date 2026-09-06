export interface AdaptiveDashboardConfig {
  showNoZeroDay: boolean;
  showComeback: boolean;
}

export const adaptiveStateService = {
  evaluateDashboard(
    daysCompletedToday: number,
    inactivityDays: number
  ): AdaptiveDashboardConfig {
    return {
      showNoZeroDay: daysCompletedToday === 0,
      showComeback: inactivityDays >= 3
    };
  }
};
export default adaptiveStateService;
