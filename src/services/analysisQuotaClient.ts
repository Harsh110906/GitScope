/**
 * UX Quota Synchronization Client
 * Manages client-side quota badge states & syncs with daily limit rule (3 free/day for guests)
 */

const DAILY_FREE_LIMIT = 3;

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function getClientQuotaState(): { count: number; remaining: number; limit: number } {
  try {
    const raw = localStorage.getItem('gitscope_daily_search');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getTodayDateKey() && typeof parsed.count === 'number') {
        return {
          count: parsed.count,
          remaining: Math.max(0, DAILY_FREE_LIMIT - parsed.count),
          limit: DAILY_FREE_LIMIT
        };
      }
    }
  } catch (e) {}

  return { count: 0, remaining: DAILY_FREE_LIMIT, limit: DAILY_FREE_LIMIT };
}

export function updateClientQuotaCount(newCount: number): void {
  try {
    const data = { date: getTodayDateKey(), count: newCount };
    localStorage.setItem('gitscope_daily_search', JSON.stringify(data));
  } catch (e) {}
}
