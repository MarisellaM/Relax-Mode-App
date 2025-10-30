
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountdownTimer from '../components/CountdownTimer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyQuest'>;

const TASKS = [
  'Take 5 minutes to breathe and stretch',
  'Tidy up your workspace',
  'Step outside for fresh air',
  'Drink a glass of water slowly',
  'Declutter one small area',
];

const STREAK_KEY = 'streak';
const LAST_COMPLETED_KEY = 'lastCompletedDate';

const DailyQuestScreen: React.FC<Props> = ({ navigation }) => {
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
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      await AsyncStorage.setItem(LAST_COMPLETED_KEY, today);
    } catch (e) {
      console.warn('Failed to save last completed date', e);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsRunning(false);

    // Basic streak logic
    try {
      const last = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let newStreak = streak;
      if (!last) {
        newStreak = streak + 1;
      } else if (last === todayStr) {
        // already completed today - no increment
        Alert.alert('Already counted', 'You already completed a quest today.');
      } else {
        // check if last was yesterday
        const lastDate = new Date(last);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = streak + 1;
        } else {
          // broke streak; reset to 1 (today)
          newStreak = 1;
        }
      }

      await saveStreak(newStreak);
      await markCompletedToday();

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
    <View style={styles.container}>
      <Text style={styles.title}>Daily Quest</Text>
      <Text style={styles.task}>{task}</Text>

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
          // Change back to 300 for a 5-minute timer - Mari
            duration={10}
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
          <Text style={styles.streak}>✨ Current Streak: {streak} day{streak === 1 ? '' : 's'}</Text>

          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={handleReset}>
            <Text style={[styles.buttonText, styles.textSecondary]}>Do Another</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    color: '#333',
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
    color: '#333',
    marginBottom: 20,
  },
});

export default DailyQuestScreen;
