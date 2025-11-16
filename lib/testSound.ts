import { Audio } from 'expo-av';

// Keep track of currently playing sound and timeout
let currentSound: Audio.Sound | null = null;
let currentFadeTimeout: NodeJS.Timeout | null = null;

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
      console.log('[TestSound] Stopping previous sound...');
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (e) {
      console.error('[TestSound] Error stopping current sound:', e);
    }
  }
}

/**
 * Play sound with configurable duration
 * @param durationSeconds - Total duration in seconds (default: 10)
 */
export async function testPlaySound(durationSeconds: number = 10) {
  // Stop any currently playing sound first
  await stopCurrentSound();
  try {
    console.log('[TestSound] Setting audio mode...');
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    console.log('[TestSound] Loading sound file...');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/images/sounds/relax-chime.mp3')
    );

    // Store reference to current sound
    currentSound = sound;

    console.log('[TestSound] Playing sound...');
    await sound.playAsync();

    console.log(`[TestSound] Sound playing for ${durationSeconds} seconds!`);

    const fadeDuration = 2000; // 2 seconds fade
    const fadeStartTime = (durationSeconds - 2) * 1000; // Start fade 2 seconds before end

    // Start fade-out before total duration ends
    currentFadeTimeout = setTimeout(async () => {
      try {
        console.log('[TestSound] Starting fade-out...');
        const steps = 20; // Number of volume steps
        const stepDuration = fadeDuration / steps;

        for (let i = steps; i >= 0; i--) {
          const volume = i / steps;
          await sound.setVolumeAsync(volume);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }

        console.log('[TestSound] Fade complete, stopping sound');
        await sound.stopAsync();
        await sound.unloadAsync();
        currentSound = null;
        currentFadeTimeout = null;
      } catch (e) {
        console.error('[TestSound] Error during fade-out:', e);
      }
    }, fadeStartTime);

    // Cleanup if it finishes naturally
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        console.log('[TestSound] Sound finished');
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch (error) {
    console.error('[TestSound] Error:', error);
  }
}
