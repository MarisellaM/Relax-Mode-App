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


type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoutine'>;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const SCENES = ['normal', 'dim', 'ambient'] as const;

export default function CreateRoutineScreen({ route, navigation }: Props) {
  const existing: Routine | undefined = (route.params as any)?.routine;

  const [name, setName] = useState(existing?.name ?? '');
  const [days, setDays] = useState<number[]>(existing?.days ?? [1, 2, 3, 4, 5]); // default weekdays
  const [time, setTime] = useState(existing?.time ?? '20:30');
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

  async function save() {
    console.log('[CreateRoutine] save() pressed');
    console.log('[CreateRoutine] current state:', {
      name,
      itemsText,
      days,
      time,
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
        ? { ...existing, name, days, items, time, scene }
        : {
            id: `routine-${Date.now()}-${Math.floor(Math.random() * 100000)}`, // ✅ replaced uuidv4()
            name,
            days,
            items,
            time,
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
      Alert.alert(
        'Routine saved',
        existing
          ? 'Your routine has been updated.'
          : 'Your routine has been created.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.warn('Failed to save routine', e);
      Alert.alert(
        'Error',
        'Something went wrong while saving this routine. Please try again.'
      );
    }
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Routine name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Evening Wind Down"
      />

      <Text style={styles.label}>Days</Text>
      <View style={styles.daysRow}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={d}
            onPress={() => toggleDay(i)}
            style={[styles.dayBtn, days.includes(i) && styles.dayActive]}
          >
            <Text
              style={{
                fontWeight: '600',
                color: days.includes(i) ? '#fff' : '#000',
              }}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Time (HH:MM)</Text>
      <TextInput
        value={time}
        onChangeText={setTime}
        style={styles.input}
        placeholder="20:30"
      />

      <Text style={styles.label}>Activities (one per line)</Text>
      <TextInput
        value={itemsText}
        onChangeText={setItemsText}
        style={[styles.input, { minHeight: 120 }]}
        placeholder={'Lighting candles\nDishes\n5 minute stretch'}
        multiline
      />

      <Text style={styles.label}>Relaxation Scene (visual preview)</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {SCENES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setScene(s as any)}
            style={[styles.sceneBtn, scene === s && styles.sceneActive]}
          >
            <Text>{s}</Text>
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
  container: { backgroundColor: '#fff' },
  label: { fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fafafa',
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
