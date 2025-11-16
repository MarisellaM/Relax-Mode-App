
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEVEL_KEY = 'app_levels_v1';
const STATS_KEY = 'app_stats_v1';

export type Stats = {
  totalRelaxMinutes: number;
  totalCleaningMinutes: number;
  weeklyStreaksCompleted: number;
};

export async function loadLevel(): Promise<{ level: number; xp: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(LEVEL_KEY);
    if (!raw) return { level: 1, xp: 0 };
    return JSON.parse(raw);
  } catch (e) {
    return { level: 1, xp: 0 };
  }
}

export async function saveLevel(obj: { level: number; xp: number }) {
  await AsyncStorage.setItem(LEVEL_KEY, JSON.stringify(obj));
}

export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return { totalRelaxMinutes: 0, totalCleaningMinutes: 0, weeklyStreaksCompleted: 0 };
    return JSON.parse(raw);
  } catch (e) {
    return { totalRelaxMinutes: 0, totalCleaningMinutes: 0, weeklyStreaksCompleted: 0 };
  }
}

export async function saveStats(s: Stats) {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(s));
}
