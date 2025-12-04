import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../lib/ThemeContext';

type LevelNumber = number;
type ProgressNumber = number;
type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

type LevelBarProps = {
  level: LevelNumber;
  progress: ProgressNumber; /* progress towards next level (0-100)*/
};

// compute level and progress percent from completed quests count
export function computeLevel(completed: number): { level: LevelNumber; progress: ProgressNumber } {
  if (completed <= 2) {
    const start = 0, size = 3; // 0,1,2 -> level 1
    const pct = ((completed - start) / size) * 100;
    return { level: 1, progress: Math.max(0, Math.min(100, Math.round(pct))) };
  }
  if (completed <= 6) {
    const start = 3, size = 4; // 3-6 -> level 2
    const pct = ((completed - start) / size) * 100;
    return { level: 2, progress: Math.max(0, Math.min(100, Math.round(pct))) };
  }
  if (completed <= 10) {
    const start = 7, size = 4; // 7-10 -> level 3
    const pct = ((completed - start) / size) * 100;
    return { level: 3, progress: Math.max(0, Math.min(100, Math.round(pct))) };
  }
  const start = 11, size = 5; // 11-15 -> level 4 (cap at 15)
  const capped = Math.min(completed, 15);
  const pct = ((capped - start) / size) * 100;
  return { level: 4, progress: Math.max(0, Math.min(100, Math.round(pct))) };
}

const LevelBar: React.FC<LevelBarProps> = ({ level, progress }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.levelBarWrap}>
      <Text style={styles.levelText}>Level {level}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%` }]} />
      </View>
      <Text style={styles.progressPercent}>{clamped}%</Text>
    </View>
  );
};

// short suggestion logic (could be replaced with more advanced rules later)
function suggestionFromCompleted(completed: number) {
  if (completed >= 10) return "Amazing consistency — consider a restful reward this week!";
  if (completed >= 5) return "Great progress — keep it up and try a small challenge!";
  if (completed === 0) return "Start small — try one 5-minute quest today.";
  return "Nice! Keep building the habit — try 2 days in a row next.";
}

const COMPLETED_KEY = 'completedQuests';

const LevelsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [completed, setCompleted] = useState<number>(0);
  const { level, progress } = computeLevel(completed);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(COMPLETED_KEY);
        const value = raw ? JSON.parse(raw) as number : 0;
        setCompleted(value);
      } catch (e) {
        console.warn('Failed to load completed quests', e);
      }
    })();
  }, []);


  const provideSuggestions = () => {
    const s = suggestionFromCompleted(completed);
    Alert.alert('Suggestion', s);
  };


  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image
        source={require('../assets/images/achievement.png')}
        style={{ width: 180, height: 180, marginBottom: 18 }}
        contentFit="contain"
      />
      <Text style={[styles.title, { color: theme.textColor }]}>Achievements</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
        Track your progress and unlock new levels as you complete more quests!
      </Text>

      <LevelBar level={level} progress={progress} />

      <Text style={[styles.small, { color: theme.secondaryTextColor }]}>Completed quests: <Text style={{ fontWeight: '700', color: theme.textColor }}>{completed}</Text></Text>



        <View style={[styles.featureBox, { borderColor: theme.borderColor }]}>
          <Text style={[styles.featureTitle, { color: theme.textColor }]}>Analytics & Suggestions</Text>
          <Text style={[styles.featureDesc, { color: theme.secondaryTextColor }]}>
            View your analytics and get personalized suggestions.
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>

            <Pressable style={styles.secondaryButton} onPress={provideSuggestions}>
              <Text style={styles.secondaryButtonText}>Get Suggestion</Text>
            </Pressable>
          </View>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  levelBarWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  progressTrack: {
    width: '90%',
    height: 18,
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76c7c0',
  },
  progressPercent: { marginTop: 6, color: '#666' },
  small: { marginTop: 8 },

  featureBox: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  featureDesc: { textAlign: 'center' },

  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2f80ed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },

  secondaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#fff', fontWeight: '700' },
});

export default LevelsScreen;
