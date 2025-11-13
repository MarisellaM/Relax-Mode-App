/*Create levels screen*/
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
/* import load daily quest data to track progress*/
import AsyncStorage from '@react-native-async-storage/async-storage';

/*connect to home button levels*/
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';

type LevelNumber = number;
type ProgressNumber = number;

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

/**
 * Map total completed quests -> { level, progress to next (% 0-100) }
 * Buckets (inclusive):
 *  L1: 0–2   (size 3)
 *  L2: 3–6   (size 4)
 *  L3: 7–10  (size 4)
 *  L4: 11–15 (size 5)  // cap at L4 for now
 */
function computeLevel(completed: number): { level: LevelNumber; progress: ProgressNumber } {
  if (completed <= 2) {
    const start = 0, size = 3;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 1, progress: Math.round(pct) };
  }
  if (completed <= 6) {
    const start = 3, size = 4;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 2, progress: Math.round(pct) };
  }
  if (completed <= 10) {
    const start = 7, size = 4;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 3, progress: Math.round(pct) };
  }
  const start = 11, size = 5;
  const pct = Math.min(100, Math.max(0, ((Math.min(completed, 15) - start) / size) * 100));
  return { level: 4, progress: Math.round(pct) };
}

const LevelsScreen: React.FC<Props> = (_props) => {
  const [completed, setCompleted] = useState<number>(0);
  const { level, progress } = computeLevel(completed);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('completedQuests');
      setCompleted(raw ? JSON.parse(raw) as number : 0);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/achievement.png')}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        contentFit="contain"
      />
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        Track your progress and unlock new levels as you complete more quests!
      </Text>

      {/* Display Level bar component */}
      <LevelBar level={level} progress={progress} />

      <Text style={{ marginTop: 12, color: '#555' }}>
        Completed quests: {completed}
      </Text>
    </View>
  );
};

/* Create the level bar that updates based on quests and will take this data from daily quest screen */
type LevelBarProps = {
  level: LevelNumber;
  progress: ProgressNumber; /* progress towards next level (0-100)*/
};

const LevelBar: React.FC<LevelBarProps> = ({ level, progress }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={{ width: '100%', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Level {level}</Text>
      <View style={{ height: 20, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 10 }}>
        <View
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: '#76c7c0',
            borderRadius: 10,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default LevelsScreen;
