export interface ActivityItem {
  id: string;
  type: 'qa' | 'explain' | 'quiz' | 'summarize' | 'recommendations';
  title: string;
  summaryText: string;
  timestamp: number;
  data: unknown;
}

const STORAGE_KEY = 'edugenie_recent_activity_v1';
const MAX_HISTORY = 20;

export function getRecentActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load recent activities from localStorage:', e);
    return [];
  }
}

export function saveActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): ActivityItem {
  try {
    const current = getRecentActivities();
    const newItem: ActivityItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...current.filter((x) => x.title !== newItem.title)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch (e) {
    console.error('Failed to save activity to localStorage:', e);
    return {
      ...item,
      id: String(Date.now()),
      timestamp: Date.now(),
    };
  }
}

export function clearActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear activities:', e);
  }
}
