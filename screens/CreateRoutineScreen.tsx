import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { addRoutine, updateRoutine, Routine } from '../lib/storage/routines';
import { useTheme } from '../lib/ThemeContext';
import { to24Hour, to12Hour, isValid12HourTime } from '../lib/timeUtils';


type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoutine'>;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const SCENES = ['normal', 'dim', 'ambient'] as const;

export default function CreateRoutineScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const existing: Routine | undefined = (route.params as any)?.routine;

  const [name, setName] = useState(existing?.name ?? '');
  const [days, setDays] = useState<number[]>(existing?.days ?? [1, 2, 3, 4, 5]); // default weekdays
  const [times, setTimes] = useState<string[]>(
    existing?.times ?? (existing?.time ? [existing.time] : ['20:30'])
  );
  const [newTimeInput, setNewTimeInput] = useState('');
  const [itemsText, setItemsText] = useState(
    (existing?.items ?? []).map((i) => i.title).join('\n')
  );
  const [scene, setScene] = useState<Routine['scene']>(existing?.scene ?? 'dim');

  useEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit Routine' : 'Create Routine' });
  }, [existing, navigation]);

  function toggleDay(i: number) {
    setDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
    );
  }

  function addTime() {
    if (!newTimeInput || !newTimeInput.trim()) {
      Alert.alert('Enter a time', 'Please enter a time with AM/PM (e.g., 8:30 PM).');
      return;
    }

    const input = newTimeInput.trim();

    // Validate 12-hour format with AM/PM
    if (!isValid12HourTime(input)) {
      Alert.alert(
        'Invalid format',
        'Please use 12-hour format with AM/PM.\n\nExamples:\n• 8:30 AM\n• 2:45 PM\n• 11:00 PM'
      );
      return;
    }

    // Convert to 24-hour format for storage
    const time24 = to24Hour(input);

    // Check for duplicates
    if (times.includes(time24)) {
      Alert.alert('Duplicate time', 'This time has already been added.');
      return;
    }

    setTimes(prev => [...prev, time24].sort());
    setNewTimeInput('');
  }

  function removeTime(timeToRemove: string) {
    setTimes(prev => prev.filter(t => t !== timeToRemove));
  }

  async function save() {
    console.log('[CreateRoutine] save() pressed');
    console.log('[CreateRoutine] current state:', {
      name,
      itemsText,
      days,
      times,
      scene,
    });

    if (!name || !name.trim()) {
      console.log('[CreateRoutine] missing name');
      Alert.alert('Name required', 'Please name this routine.');
      return;
    }

    const lines = (itemsText || '')
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    console.log('[CreateRoutine] parsed lines:', lines);

    if (lines.length === 0) {
      console.log('[CreateRoutine] no activities entered');
      Alert.alert(
        'Add at least one activity',
        'Please enter at least one activity for this routine.'
      );
      return;
    }

    const items = lines.map((title, i) => ({
      id: existing?.items?.[i]?.id ?? `it-${i}`,
      title,
      durationMin: 5,
    }));
    console.log('[CreateRoutine] items built:', items);

    let routine: Routine;
    try {
    routine = existing
        ? { ...existing, name, days, items, times, scene }
        : {
            id: `routine-${Date.now()}-${Math.floor(Math.random() * 100000)}`, // ✅ replaced uuidv4()
            name,
            days,
            items,
            times,
            scene,
        };
    console.log('[CreateRoutine] routine to save:', routine);
    } catch (e) {
    console.warn('[CreateRoutine] error building routine object', e);
    Alert.alert(
        'Error',
        'Something went wrong while preparing this routine. Please try again.'
    );
    return;
    }

    try {
      if (existing) {
        console.log('[CreateRoutine] calling updateRoutine');
        await updateRoutine(routine);
      } else {
        console.log('[CreateRoutine] calling addRoutine');
        await addRoutine(routine);
      }

      console.log('[CreateRoutine] save successful, showing alert');

      if (existing) {
        // Updated existing routine
        Alert.alert(
          '✓ Routine Updated',
          `"${name}" has been successfully updated.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Created new routine - more detailed confirmation
        const daysText = days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
        const timesText = times.map(t => to12Hour(t)).join(', ');

        Alert.alert(
          '🎉 Routine Created!',
          `"${name}" has been successfully created!\n\n` +
          `📅 Days: ${daysText}\n` +
          `⏰ Times: ${timesText}\n` +
          `✨ Activities: ${items.length} steps\n\n` +
          `You'll receive reminders when it's time to start your routine.`,
          [{ text: 'Got it!', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      console.warn('Failed to save routine', e);
      Alert.alert(
        'Error',
        'Something went wrong while saving this routine. Please try again.'
      );
    }
  }


  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.label, { color: theme.textColor }]}>Routine name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor, color: theme.textColor }]}
        placeholder="Evening Wind Down"
        placeholderTextColor={theme.placeholderTextColor}
      />

      <Text style={[styles.label, { color: theme.textColor }]}>Days</Text>
      <View style={styles.daysRow}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            onPress={() => toggleDay(i)}
            style={[
              styles.dayBtn,
              days.includes(i) && styles.dayActive,
              { backgroundColor: days.includes(i) ? '#2f80ed' : theme.cardBackground, borderColor: theme.borderColor, borderWidth: days.includes(i) ? 0 : 1 },
            ]}
          >
                <Text style={{ fontWeight: '600', color: days.includes(i) ? '#fff' : theme.textColor }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textColor }]}>Scheduled Times</Text>

      {/* Display existing times */}
      {times.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          {times.map((t, idx) => (
            <View key={idx} style={[styles.timeChip, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <Text style={{ color: theme.textColor, fontSize: 16, fontWeight: '600' }}>
                {to12Hour(t)}
              </Text>
              <TouchableOpacity onPress={() => removeTime(t)} style={styles.removeTimeBtn}>
                <Text style={{ color: '#e74c3c', fontWeight: '600', fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add new time */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TextInput
          value={newTimeInput}
          onChangeText={setNewTimeInput}
          style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: theme.cardBackground, borderColor: theme.borderColor, color: theme.textColor }]}
          placeholder="8:30 PM"
          placeholderTextColor={theme.placeholderTextColor}
        />
        <TouchableOpacity onPress={addTime} style={[styles.addTimeBtn, { backgroundColor: '#2f80ed' }]}>
          <Text style={{ color: 'white', fontWeight: '600' }}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 12, color: theme.secondaryTextColor, marginBottom: 12, fontStyle: 'italic' }}>
        Use 12-hour format with AM/PM (e.g., 8:30 AM, 2:45 PM, 11:00 PM)
      </Text>

      <Text style={[styles.label, { color: theme.textColor }]}>Activities (one per line)</Text>
      <TextInput
        value={itemsText}
        onChangeText={setItemsText}
        style={[styles.input, { minHeight: 120, backgroundColor: theme.cardBackground, borderColor: theme.borderColor, color: theme.textColor }]}
        placeholder={'Lighting candles\nDishes\n5 minute stretch'}
        placeholderTextColor={theme.placeholderTextColor}
        multiline
      />

      <Text style={[styles.label, { color: theme.textColor }]}>Relaxation Scene (visual preview)</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {SCENES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setScene(s as any)}
            style={[
              styles.sceneBtn,
              scene === s && styles.sceneActive,
              { backgroundColor: scene === s ? '#cfe1ff' : theme.cardBackground, borderColor: theme.borderColor, borderWidth: 1 },
            ]}
          >
            <Text style={{ color: theme.textColor }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={save} style={styles.saveBtn}>
        <Text style={{ color: 'white', fontWeight: '700' }}>
          {existing ? 'Save changes' : 'Create Routine'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBtn: {
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dayActive: { backgroundColor: '#2f80ed' },
  timeChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  removeTimeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addTimeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneBtn: {
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  sceneActive: { backgroundColor: '#cfe1ff' },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#2f80ed',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
