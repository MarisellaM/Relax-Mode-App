import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountdownTimer from '../components/CountdownTimer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';
import { loadStats, saveStats } from '../lib/storage/levels';
import { useTheme } from '../lib/ThemeContext';
import { playSoundEffect } from '../lib/soundEffects';
import { computeLevel } from './levels';
import { testPlaySound } from '../lib/testSound';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';



type Props = NativeStackScreenProps<RootStackParamList, 'DailyQuest'>;

const TASKS = [
  'Take 5 minutes to breathe and stretch',
  'Tidy up your workspace',
  'Step outside for fresh air',
  'Drink a glass of water slowly',
  'Declutter one small area',
];

const QUEST_DURATION_SECONDS = 10; // set to 10 for testing, change back to 300 later

const STREAK_KEY = 'streak';
const LAST_COMPLETED_KEY = 'lastCompletedDate';

// Update analytics stats when a daily quest is completed
async function recordDailyQuestCompletion(durationSeconds: number) {
  try {
    const stats = await loadStats();
    const minutes = Math.round(durationSeconds / 60); // e.g. 5 minutes per quest
    // We treat the daily quest as a relaxation activity
    const updated = {
      ...stats,
      totalRelaxMinutes: stats.totalRelaxMinutes + minutes,
    };
    await saveStats(updated);
  } catch (e) {
    console.warn('Failed to record daily quest in stats', e);
  }
}

const DailyQuestScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [task, setTask] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomTask = TASKS[Math.floor(Math.random() * TASKS.length)];
    setTask(randomTask);
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) setStreak(Number(stored));
    } catch (e) {
      console.warn('Failed to load streak', e);
    }
  };

  const saveStreak = async (value: number) => {
    try {
      setStreak(value);
      await AsyncStorage.setItem(STREAK_KEY, value.toString());
    } catch (e) {
      console.warn('Failed to save streak', e);
    }
  };

  const markCompletedToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; /* YYYY-MM-DD */
      await AsyncStorage.setItem(LAST_COMPLETED_KEY, today);
    } catch (e) {
      console.warn('Failed to save last completed date', e);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsRunning(false);

    /* Basic streak logic */
    try {
      const last = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let newStreak = streak;
      if (!last) {
        newStreak = streak + 1;
      } else if (last === todayStr) {
        /* already completed today - no increment */
        Alert.alert('Already counted', 'You already completed a quest today.');
      } else {
        /* check if last was yesterday */
        const lastDate = new Date(last);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = streak + 1;
        } else {
          /*  broke streak; reset to 1 (today) */
          newStreak = 1;
        }
      }

      await saveStreak(newStreak);
      await markCompletedToday();

      // Check for level up
      const beforeCount = await LoadDailyQuestData();
      const levelBefore = computeLevel(beforeCount);

      await incrementCompletedQuests();

      const afterCount = beforeCount + 1;
      const levelAfter = computeLevel(afterCount);

      await recordDailyQuestCompletion(QUEST_DURATION_SECONDS);

      // Play completion sound (or special level up sound)
      console.log('[DailyQuest] About to play completion sound...');
      if (levelAfter.level > levelBefore.level) {
        // Level up! Play sound and show alert
        console.log('[DailyQuest] Level up detected! Playing sound...');
        await testPlaySound();
        Alert.alert(
          '🎉 Level Up!',
          `Congratulations! You've reached Level ${levelAfter.level}!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        // Regular completion sound
        console.log('[DailyQuest] Regular completion, playing sound...');
        await testPlaySound();
      }
      console.log('[DailyQuest] Sound should have played');

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.warn('Error completing quest', e);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTask(TASKS[Math.floor(Math.random() * TASKS.length)]);
    fadeAnim.setValue(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image
        source={require('../assets/images/DailyQuest.png')}
        style={{ width: 500, height: 200, marginBottom: 1 }}
        contentFit="contain"
      />
      <Text style={[styles.title, {fontSize: 50, color:"#70AD8F" }]}>Daily Quest</Text>
      <Text style={[styles.task, {fontWeight: 'bold', color: theme.textColor }]}>{task}</Text>
      <Text style={[styles.streak, { color: theme.textColor }]}>🔥 Current Streak: {streak} day{streak === 1 ? '' : 's'}</Text>

      {!isRunning && !isComplete && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => setIsRunning(true)}>
            <Text style={styles.buttonText}>Start 5-Minute Timer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => {
            setTask(TASKS[Math.floor(Math.random() * TASKS.length)]);
          }}>
            <Text style={[styles.buttonText, styles.textSecondary]}>New Task</Text>
          </TouchableOpacity>
        </>
      )}

      {isRunning && (
        <>
          <CountdownTimer
          // changed this to a constant so it will be easier to flip flop if needed
            duration={QUEST_DURATION_SECONDS}
            onComplete={handleComplete}
            isRunning={isRunning}
          />

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => { setIsRunning(false); }}>
            <Text style={[styles.buttonText, styles.textSecondary]}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}

      {isComplete && (
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          
          <Image
           source={require('../assets/images/congrats.gif')}
            style={{ width: 150, height: 150, marginBottom: 10 }}
            contentFit="contain"
          />

          <Text style={styles.congrats}>🌞 Well done!</Text>
          <Text style={[styles.streak, { color: theme.textColor }]}>✨ Current Streak: {streak} day{streak === 1 ? '' : 's'}</Text>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleReset}>
            <Text style={[styles.buttonText, styles.textSecondary]}>Do Another</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

       <Text style={[styles.streak, { color: theme.textColor,}]}> LEVEL </Text>
       
    </View>
  );
};

/* Store the number of completed daily quests to update levels screen*/
const LoadDailyQuestData = async () => {
  try {
    const completedQuests = await AsyncStorage.getItem('completedQuests');
    return completedQuests ? JSON.parse(completedQuests) : 0;
  } catch (e) {
    console.warn('Failed to load completed quests', e);
    return 0;
  }
};

async function incrementCompletedQuests(): Promise<number> {
  const raw = await AsyncStorage.getItem('completedQuests');
  const current = raw ? JSON.parse(raw) as number : 0;
  const next = current + 1;
  await AsyncStorage.setItem('completedQuests', JSON.stringify(next));
  return next;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  task: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2f80ed',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#efefef',
  },
  testButton: {
    backgroundColor: '#f39c12',
  },
  textSecondary: {
    color: '#333',
  },
  congrats: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#27ae60',
  },
  streak: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default DailyQuestScreen;
