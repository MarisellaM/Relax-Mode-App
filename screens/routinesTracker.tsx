/* this will go into the relaxation screen feature */
/*Moderate Task - Customize Your Routine
User Goal: Create a personalized weekly routine that mixes cleaning and relaxation.

The user opens "My Routines" and creates a new one called "Evening Wind Down"
They select:
Days of the week (Mon-Fri)
Activities (lighting candles, doing dishes, etc.)
Time reminders (e.g. 8:30pm)
Duration of each activity
Optional "relaxation scene" (dim screen, background sound)
They save the routine
The app displays it as a path they can "Complete" each day */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Routine, loadRoutines, updateRoutine } from '../lib/storage/routines';
import { useTheme } from '../lib/ThemeContext';
import { loadStats, saveStats } from '../lib/storage/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineTracker'>;

type Step = {
  id: string;
  title: string;
  done: boolean;
};

export default function RoutineTrackerScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { routineId } = route.params;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await loadRoutines();
      const found = all.find(r => r.id === routineId) ?? null;
      setRoutine(found);

      if (found) {
        const mapped: Step[] = found.items.map(it => ({
          id: it.id,
          title: it.title,
          done: false,
        }));
        setSteps(mapped);
      }
    })();
  }, [routineId]);

  useEffect(() => {
    if (routine) {
      navigation.setOptions({ title: routine.name });
    }
  }, [routine, navigation]);

  const markCurrentStepDone = () => {
    if (!routine) return;
    if (isComplete) return;

    setSteps(prev => {
      const copy = [...prev];
      if (currentIndex < copy.length) {
        copy[currentIndex] = { ...copy[currentIndex], done: true };
      }
      return copy;
    });

    const nextIndex = currentIndex + 1;
    if (nextIndex >= steps.length) {
      setIsComplete(true);
      handleRoutineComplete();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  async function markRoutineCompletedToday(r: Routine) {
    try {
      const updatedRoutine: Routine = {
        ...r,
        lastRunAt: Date.now(), // mark this routine as completed now
      };
      await updateRoutine(updatedRoutine);
      setRoutine(updatedRoutine); // keep local state in sync
    } catch (e) {
      console.warn('Failed to update routine lastRunAt', e);
    }
  }

  async function handleRoutineComplete() {
    if (!routine) return;

    try {
        await markRoutineCompletedToday(routine);
        const stats = await loadStats();
      // simple XP rule: +2 minutes relax + 2 minutes cleaning per routine
      const updated = {
        ...stats,
        totalRelaxMinutes: stats.totalRelaxMinutes + 2,
        totalCleaningMinutes: stats.totalCleaningMinutes + 2,
      };
      await saveStats(updated);

      Alert.alert(
        'Routine complete!',
        'Nice work sticking to your path. You earned some progress toward your levels.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.warn('Failed to update stats for routine completion', e);
      Alert.alert(
        'Routine complete',
        'Great job completing your routine!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }

  const renderItem = ({ item, index }: { item: Step; index: number }) => {
    const isActive = index === currentIndex && !isComplete;
    return (
      <View
        style={[
          styles.stepRow,
          { borderColor: theme.borderColor },
          item.done && styles.stepDone,
          isActive && styles.stepActive,
        ]}
      >
        <View style={styles.stepBulletWrap}>
          <View
            style={[
              styles.bullet,
              item.done && styles.bulletDone,
              isActive && styles.bulletActive,
            ]}
          />
          {index !== steps.length - 1 && (
            <View style={styles.verticalLine} />
          )}
        </View>

        <View style={styles.stepTextWrap}>
          <Text
            style={[
              styles.stepTitle,
              { color: theme.textColor },
              item.done && { textDecorationLine: 'line-through', opacity: 0.6 },
            ]}
          >
            {item.title}
          </Text>
          {isActive && !item.done && (
            <Text style={styles.stepHint}>Current step</Text>
          )}
          {item.done && <Text style={styles.stepHint}>Done</Text>}
        </View>
      </View>
    );
  };

  if (!routine) {
    return (
      <View style={[styles.center, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.textColor }}>Routine not found.</Text>
      </View>
    );
  }

  const allDone = steps.length > 0 && steps.every(s => s.done);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.textColor }]}>
        Follow your routine path
      </Text>
      <Text style={[styles.subheader, { color: theme.secondaryTextColor }]}>
        Check off each activity one by one.
      </Text>

      <FlatList
        data={steps}
        keyExtractor={s => s.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      <View style={styles.bottomBar}>
        {!allDone && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={markCurrentStepDone}
          >
            <Text style={styles.primaryButtonText}>
              Mark step as done
            </Text>
          </TouchableOpacity>
        )}

        {allDone && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#27ae60' }]}
            onPress={handleRoutineComplete}
          >
            <Text style={styles.primaryButtonText}>
              Complete routine
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepDone: {
    backgroundColor: '#e8f8f5',
  },
  stepActive: {
    borderColor: '#2f80ed',
    backgroundColor: '#eaf2ff',
  },
  stepBulletWrap: {
    width: 30,
    alignItems: 'center',
  },
  bullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
  },
  bulletDone: {
    borderColor: '#27ae60',
    backgroundColor: '#27ae60',
  },
  bulletActive: {
    borderColor: '#2f80ed',
    backgroundColor: '#2f80ed',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#dde1e3',
    marginTop: 2,
  },
  stepTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepHint: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  bottomBar: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  primaryButton: {
    backgroundColor: '#2f80ed',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
  },
});
