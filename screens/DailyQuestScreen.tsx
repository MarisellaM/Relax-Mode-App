import React, { useState, useEffect, useRef } from 'react';
import {Text, StyleSheet, TouchableOpacity, Animated, Alert, ScrollView, View, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountdownTimer from '../components/CountdownTimer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';
import { loadStats, saveStats } from '../lib/storage/levels';
import { useTheme } from '../lib/ThemeContext';
import { testPlaySound } from '../lib/testSound';

type LevelNumber = number;
type ProgressNumber = number;
type Props = NativeStackScreenProps<RootStackParamList, 'DailyQuest'>;

type LevelBarProps = {
  level: LevelNumber;
  progress: ProgressNumber;
};

// compute level and progress percent
export function computeLevel(completed: number): { level: LevelNumber; progress: ProgressNumber } {
  if (completed <= 2) {
    const pct = (completed / 3) * 100;
    return { level: 1, progress: Math.round(pct) };
  }
  if (completed <= 6) {
    const pct = ((completed - 3) / 4) * 100;
    return { level: 2, progress: Math.round(pct) };
  }
  if (completed <= 10) {
    const pct = ((completed - 7) / 4) * 100;
    return { level: 3, progress: Math.round(pct) };
  }
  const capped = Math.min(completed, 15);
  const pct = ((capped - 11) / 5) * 100;
  return { level: 4, progress: Math.round(pct) };
}

function suggestionFromCompleted(completed: number) {
  if (completed >= 10) return "Amazing consistency — consider a restful reward this week!";
  if (completed >= 5) return "Great progress — keep it up and try a small challenge!";
  if (completed === 0) return "Start small — try one 5-minute quest today.";
  return "Nice! Keep building the habit — try 2 days in a row next.";
}

const COMPLETED_KEY = 'completedQuests';

const TASKS = [
  'Tidy up your workspace',
  'Step outside for fresh air',
  'Drink a glass of water slowly',
  'Declutter one small area',
];

const QUEST_DURATION_SECONDS = 10;
const STREAK_KEY = 'streak';
const LAST_COMPLETED_KEY = 'lastCompletedDate';

async function recordDailyQuestCompletion(durationSeconds: number) {
  try {
    const stats = await loadStats();
    const minutes = Math.round(durationSeconds / 60);
    const updated = {
      ...stats,
      totalRelaxMinutes: stats.totalRelaxMinutes + minutes,
    };
    await saveStats(updated);
  } catch {}
}

const DailyQuestScreen: React.FC<Props> = ({ navigation }) => {

  const { theme } = useTheme();


  const [completed, setCompleted] = useState(0);
  const { level, progress } = computeLevel(completed);


  const provideSuggestions = () => {
    Alert.alert("Suggestion", suggestionFromCompleted(completed));
  };


  const [task, setTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTask(TASKS[Math.floor(Math.random() * TASKS.length)]);
    loadStreak();

    // load completed count and check whether user already completed today
    (async () => {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      setCompleted(raw ? JSON.parse(raw) : 0);

      const last = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
      const today = new Date().toISOString().split('T')[0];
      if (last === today) {
        // mark UI as completed for today and keep it shown until next day
        setIsComplete(true);
        fadeAnim.setValue(1);
      }
    })();
  }, []);

  const loadStreak = async () => {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    if (stored) setStreak(Number(stored));
  };

  const saveStreak = async (value: number) => {
    setStreak(value);
    await AsyncStorage.setItem(STREAK_KEY, value.toString());
  };

  const markCompletedToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(LAST_COMPLETED_KEY, today);
  };

  const handleComplete = async () => {
    setIsRunning(false);

    const last = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
    const today = new Date().toISOString().split('T')[0];

    // If already completed today, show the completed UI and avoid double-counting
    if (last === today) {
      setIsComplete(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      Alert.alert("Already counted", "You already completed a quest today.");
      return;
    }

    let newStreak = streak;
    if (!last) newStreak = streak + 1;
    else {
      const diff = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
      newStreak = diff === 1 ? streak + 1 : 1;
    }

    await saveStreak(newStreak);
    await markCompletedToday();

    await incrementCompletedQuests();
    setCompleted(prev => prev + 1);

    await recordDailyQuestCompletion(QUEST_DURATION_SECONDS);

    setIsComplete(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTask(TASKS[Math.floor(Math.random() * TASKS.length)]);
    fadeAnim.setValue(0);
  };

  return (
    <ScrollView 
      style={{flex:1, backgroundColor: theme.backgroundColor}}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >

      <Image source={require('../assets/images/DailyQuest.png')} style={{ width: 500, height: 100 }} />

      <Text style={[styles.title, { fontSize: 50, color: "#70AD8F" }]}>Daily Quest</Text>
      <Text style={[styles.task, { color: theme.textColor }]}>{task}</Text>

      {!isRunning && !isComplete && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => setIsRunning(true)}>
            <Text style={styles.buttonText}>Start 5-Minute Timer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => setTask(TASKS[Math.floor(Math.random()*TASKS.length)])}>
            <Text style={[styles.buttonText, styles.textSecondary]}>New Task</Text>
          </TouchableOpacity>
        </>
      )}

      {isRunning && (
        <>
          <CountdownTimer duration={QUEST_DURATION_SECONDS} onComplete={handleComplete} isRunning={isRunning} />
          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => setIsRunning(false)}>
            <Text style={[styles.buttonText, styles.textSecondary]}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {isComplete && (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Image source={require('../assets/images/congrats.gif')} style={{ width: 250, height: 130 }} />
          <Text style={styles.congrats}>🌞 Well done!</Text>
          <Text style={[styles.streak, { color: theme.textColor }]}>✨ Current Streak: {streak} days</Text>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleReset}>
            <Text style={[styles.buttonText, styles.textSecondary]}>Do Another</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Image source={require('../assets/images/achievement.png')} style={{ width: 180, height: 180 }} />
      <Text style={[styles.title, { color: theme.textColor }]}>Achievements</Text>

      <LevelBar level={level} progress={progress} />

      <Text style={[styles.small, { color: theme.secondaryTextColor }]}>
        Completed quests: <Text style={{ fontWeight: "700", color: theme.textColor }}>{completed}</Text>
      </Text>

      <View style={[styles.featureBox, { borderColor: theme.borderColor }]}>
        <Text style={[styles.featureTitle, { color: theme.textColor }]}>Analytics & Suggestions</Text>
        <Text style={[styles.featureDesc, { color: theme.secondaryTextColor }]}>
          View your analytics and get personalized suggestions.
        </Text>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Analytics')}>
          <Text style={styles.secondaryButtonText}>View Analytics</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={provideSuggestions}>
          <Text style={styles.secondaryButtonText}>Get Suggestion</Text>
        </Pressable>
      </View>

    </ScrollView>
  );
};

async function incrementCompletedQuests(): Promise<number> {
  const raw = await AsyncStorage.getItem(COMPLETED_KEY);
  const current = raw ? JSON.parse(raw) : 0;
  const next = current + 1;
  await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
  return next;
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 18 },
  task: { fontSize: 18, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#2f80ed', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: '#efefef' },
  textSecondary: { color: '#333' },
  congrats: { fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#70AD8F' },
  streak: { fontSize: 16, marginBottom: 20 },
  levelBarWrap: { width: '100%', alignItems: 'center', marginBottom: 8 },
  levelText: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  progressTrack: { width: '90%', height: 18, backgroundColor: '#e6e6e6', borderRadius: 10 },
  progressFill: { height: '100%', backgroundColor: '#76c7c0' },
  progressPercent: { marginTop: 6 },
  small: { marginTop: 8 },
  featureBox: { marginTop: 16, padding: 14, borderWidth: 1, borderRadius: 10, width: '100%', alignItems: 'center' },
  featureTitle: { fontSize: 16, fontWeight: '700' },
  featureDesc: { textAlign: 'center' },
  secondaryButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginTop: 10 },
  secondaryButtonText: { color: '#fff', fontWeight: '700' },
});

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

export default DailyQuestScreen;
