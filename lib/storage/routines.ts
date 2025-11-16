
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RoutineItem = {
  id: string;
  title: string;
  durationMin: number;
};

export type RoutineScene = 'normal' | 'dim' | 'ambient';

export type Routine = {
  id: string;
  name: string;
  days: number[];       // 0–6 (Sunday–Saturday)
  items: RoutineItem[];
  time?: string;        // "HH:MM"
  scene: RoutineScene;
};

const ROUTINES_KEY = 'routines';

// load all routines from storage 
export async function loadRoutines(): Promise<Routine[]> {
  try {
    const raw = await AsyncStorage.getItem(ROUTINES_KEY);
    console.log('[routines] loadRoutines raw:', raw);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Routine[];
  } catch (e) {
    console.warn('Failed to load routines', e);
    return [];
  }
}

// save the given routines array to storage 
async function saveAll(routines: Routine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.warn('Failed to save routines', e);
    throw e;
  }
}

// add a new routine 
export async function addRoutine(routine: Routine): Promise<void> {
  const current = await loadRoutines();
  const updated = [...current, routine];
  await saveAll(updated);
}

// update an existing routine by id 
export async function updateRoutine(routine: Routine): Promise<void> {
  const current = await loadRoutines();
  const updated = current.map(r => (r.id === routine.id ? routine : r));
  await saveAll(updated);
}

// remove a routine by id 
export async function removeRoutine(id: string): Promise<void> {
  const current = await loadRoutines();
  const updated = current.filter(r => r.id !== id);
  await saveAll(updated);
}
