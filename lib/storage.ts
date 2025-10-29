// Storage.ts
// Purpose: Saving and loading app data using AsyncStorage in React Native
// Will add more comments later - Mari 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, Streak } from './models';

// Save the user's routines to AsyncStorage
const K = { 
    STREAK: 'streak',   // Key for storing streak data
    ROUTINES: 'routines',   // Key for storing routines data
};

// Function to safely parse JSON strings
function safeJSONParse<T> (raw: string | null, fallback: T): T {
    try {
        return raw ? JSON.parse(raw) as T : fallback;
    } catch {
        return fallback;
    }   
}

// Save streak to AsyncStorage
export async function saveStreak(streak: Streak): Promise<void> {
    await AsyncStorage.setItem(K.STREAK, JSON.stringify(streak));
}

// Load streak from AsyncStorage
export async function loadStreak(): Promise<Streak> {
    const raw = await AsyncStorage.getItem(K.STREAK);
    return safeJSONParse<Streak>(raw, { count: 0, level: 0, lastCompleted: '' });
}

// Load routines from AsyncStorage
export async function loadRoutines(): Promise<Routine[]> {
    const raw = await AsyncStorage.getItem(K.ROUTINES);
    return safeJSONParse<Routine[]>(raw, []);
}

// Save routines to AsyncStorage
export async function saveRoutines(routines: Routine[]): Promise<void> {
    const raw = JSON.stringify(routines);
    await AsyncStorage.setItem(K.ROUTINES, raw);
}

// Generate the next streak after completing a task 
export function generateNextStreak(current: Streak, when: Date = new Date()): Streak {
    const today = when.toDateString();
    const last = current.lastCompleted ? new Date(current.lastCompleted).toDateString() : "";
    const count = today === last ? current.count : current.count + 1;
    const level = 1 + Math.floor(count / 7);
    return {
        count,
        level,
        lastCompleted: when.toISOString(),
    };
}

// Reset streak to zero
export async function resetStreak(): Promise<void> {
    await AsyncStorage.removeItem(K.STREAK);
}

// Clear all saved routines
export async function clearRoutines(): Promise<void> {
    await AsyncStorage.removeItem(K.ROUTINES);
}