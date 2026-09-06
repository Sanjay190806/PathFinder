const CACHE_KEY = 'sanzz_os_analytics_cache_v1';

export const analyticsCacheService = {
  getCache(): any | null {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Expire after 10 minutes to verify freshness
        if (Date.now() - parsed.timestamp < 600000) {
          return parsed.data;
        }
      }
    } catch (e) {
      // Parse issue
    }
    return null;
  },

  setCache(data: any): void {
    try {
      const payload = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed saving analytics cache:', e);
    }
  },

  invalidate(): void {
    localStorage.removeItem(CACHE_KEY);
  }
};
export default analyticsCacheService;
