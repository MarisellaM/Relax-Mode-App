import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const SOUND_EFFECTS_KEY = 'soundEffectsEnabled';

// Initialize audio mode
let audioInitialized = false;

// Keep track of currently playing sound and timeout
let currentSound: Audio.Sound | null = null;
let currentFadeTimeout: NodeJS.Timeout | null = null;

async function initializeAudio() {
  if (audioInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioInitialized = true;
    console.log('[SoundEffects] Audio mode initialized');
  } catch (e) {
    console.error('[SoundEffects] Failed to initialize audio mode', e);
  }
}

/**
 * Stop any currently playing sound
 */
async function stopCurrentSound() {
  if (currentFadeTimeout) {
    clearTimeout(currentFadeTimeout);
    currentFadeTimeout = null;
  }

  if (currentSound) {
    try {
      console.log('[SoundEffects] Stopping previous sound...');
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (e) {
      console.error('[SoundEffects] Error stopping current sound:', e);
    }
  }
}

/**
 * Check if sound effects are enabled
 */
export async function isSoundEffectsEnabled(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(SOUND_EFFECTS_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default to true if not set
    return true;
  } catch (e) {
    console.error('[SoundEffects] Failed to check if sound effects are enabled', e);
    return true;
  }
}

/**
 * Play a sound effect if sound effects are enabled
 * @param soundFile - The sound file to play (e.g., require('../assets/sounds/chime.mp3'))
 */
export async function playSoundEffect(soundFile: any): Promise<void> {
  try {
    const enabled = await isSoundEffectsEnabled();

    if (!enabled) {
      console.log('[SoundEffects] Sound effects disabled in settings, skipping playback');
      return;
    }

    // Stop any currently playing sound first
    await stopCurrentSound();

    // Initialize audio mode if needed
    await initializeAudio();

    console.log('[SoundEffects] Creating sound...');
    const { sound } = await Audio.Sound.createAsync(soundFile);

    // Store reference to current sound
    currentSound = sound;

    console.log('[SoundEffects] Playing sound...');
    await sound.playAsync();

    console.log('[SoundEffects] Sound is playing!');

    // Start fade-out after 8 seconds (fade for 2 seconds, total 10 seconds)
    currentFadeTimeout = setTimeout(async () => {
      try {
        console.log('[SoundEffects] Starting fade-out...');
        const fadeDuration = 2000; // 2 seconds fade
        const steps = 20; // Number of volume steps
        const stepDuration = fadeDuration / steps;

        for (let i = steps; i >= 0; i--) {
          const volume = i / steps;
          await sound.setVolumeAsync(volume);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }

        console.log('[SoundEffects] Fade complete, stopping sound');
        await sound.stopAsync();
        await sound.unloadAsync();
        currentSound = null;
        currentFadeTimeout = null;
      } catch (e) {
        console.error('[SoundEffects] Error during fade-out:', e);
      }
    }, 8000);

    // Unload the sound after it finishes playing (if it finishes naturally before timeout)
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        console.log('[SoundEffects] Sound finished, unloading...');
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch (e) {
    console.error('[SoundEffects] Failed to play sound effect:', e);
  }
}
