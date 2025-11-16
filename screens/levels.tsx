/*Create levels screen*/
/*  The user enables "Relaxation Automation" so the app can automatically remind them of cleaning/relaxation through notifications
  They can view their analytics to see time spent relaxing and time spent cleaning
  App can provide suggestions based on habits such as "You've cleaned 5 days straight, time to rest for a day."
*/
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { RootStackParamList } from '../navigation/RootNavigator';

type LevelNumber = number;
type ProgressNumber = number;
type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

type LevelBarProps = {
  level: LevelNumber;
  progress: ProgressNumber; /* progress towards next level (0-100)*/
};

// compute level and progress percent from completed quests count
function computeLevel(completed: number): { level: LevelNumber; progress: ProgressNumber } {
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

  const openAnalytics = () => {
    // Ensure 'Analytics' route exists in RootNavigator
    navigation.navigate('Analytics' as keyof RootStackParamList);
  };

  const provideSuggestions = () => {
    const s = suggestionFromCompleted(completed);
    Alert.alert('Suggestion', s);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/images/achievement.png')}
        style={{ width: 180, height: 180, marginBottom: 18 }}
        contentFit="contain"
      />
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        Track your progress and unlock new levels as you complete more quests!
      </Text>

      <LevelBar level={level} progress={progress} />

      <Text style={styles.small}>Completed quests: <Text style={{ fontWeight: '700' }}>{completed}</Text></Text>

      <View style={{ width: '100%', marginTop: 12 }}>
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>Relaxation Automation</Text>
          <Text style={styles.featureDesc}>
            Enable app reminders and automation for your routines.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Automation', 'Automation enabled (demo).')}>
            <Text style={styles.primaryButtonText}>Enable Automation</Text>
          </Pressable>
        </View>

        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>Analytics & Suggestions</Text>
          <Text style={styles.featureDesc}>
            View your analytics and get personalized suggestions.
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Pressable style={styles.secondaryButton} onPress={openAnalytics}>
              <Text style={styles.secondaryButtonText}>View Analytics</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={provideSuggestions}>
              <Text style={styles.secondaryButtonText}>Get Suggestion</Text>
            </Pressable>
          </View>
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
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
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
  small: { marginTop: 8, color: '#555' },

  featureBox: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  featureDesc: { textAlign: 'center', color: '#666' },

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
