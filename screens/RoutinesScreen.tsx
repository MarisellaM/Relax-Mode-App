
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Routine, loadRoutines, removeRoutine } from '../lib/storage/routines';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../lib/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Routines'>;

export default function RoutinesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [routines, setRoutines] = useState<Routine[]>([]);

  async function refresh() {
    const all = await loadRoutines();
    setRoutines(all);
    checkForDueRoutines(all);

    function checkForDueRoutines(all: Routine[]) {
      if (!all.length) return;

      const now = new Date();
      const todayIndex = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // give or  take 15 mins
      const WINDOW_MIN = 15;

      const due = all.find(r => {
        if (!r.time) return false;
        if (!r.days.includes(todayIndex)) return false;

        // skip if already completed today
        if (r.lastRunAt) {
          const last = new Date(r.lastRunAt);
          const sameDay =
            last.getFullYear() === now.getFullYear() &&
            last.getMonth() === now.getMonth() &&
            last.getDate() === now.getDate();
          if (sameDay) {
            return false;
          }
        }

        const [hh, mm] = r.time.split(':').map(n => parseInt(n, 10));
        if (isNaN(hh) || isNaN(mm)) return false;

        const routineMinutes = hh * 60 + mm;
        const diff = Math.abs(routineMinutes - currentMinutes);
        return diff <= WINDOW_MIN;
      });

      if (due) {
        Alert.alert(
          'Routine reminder',
          `It's time for your "${due.name}" routine. Want to start it now?`,
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Start routine',
              onPress: () => {
                navigation.navigate('RoutineTracker', { routineId: due.id });
              },
            },
          ]
        );
      }
    }


  }

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => refresh());
    refresh();
    return unsub;
  }, [navigation]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete routine?', 'Are you sure you want to delete this routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeRoutine(id);
          refresh();
        },
      },
    ]);
  };

function formatDaysShort(days: number[]) {
  const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days.map(d => labels[d]).join(', ');
}

// simple next-run label: just shows “Next: Today at 20:30” or “Next: Mon, Wed at 20:30”
function buildNextRunLabel(item: Routine): string {
  if (!item.time) return '';
  const now = new Date();
  const todayIndex = now.getDay(); // 0-6 (Sun-Sat)

  const hasToday = item.days.includes(todayIndex);
  if (hasToday) {
    return `Next: Today at ${item.time}`;
  }
  return `Next: ${formatDaysShort(item.days)} at ${item.time}`;
}

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>My Routines</Text>

      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#2f80ed' }]} onPress={() => navigation.navigate('CreateRoutine')}>
        <Text style={[styles.addText, { color: '#fff' }]}>+ Create Routine</Text>
      </TouchableOpacity>

<FlatList
  data={routines}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor, borderWidth: 1 }] }>
      <Text style={[styles.routineName, { color: theme.textColor }]}>{item.name}</Text>

      <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>
        Days: {item.days.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
      </Text>

      <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>Time: {item.time ?? '—'}</Text>

      {/* next run line */}
      {item.time && (
        <Text style={[styles.meta, { fontStyle: 'italic', marginTop: 2, color: theme.secondaryTextColor }]}> 
          {buildNextRunLabel(item)}
        </Text>
      )}

      {/* buttons row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {/* start routine button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RoutineTracker', { routineId: item.id })}
          style={[styles.smallBtn, { backgroundColor: '#2ecc71', borderColor: '#27ae60' }]}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Start</Text>
        </TouchableOpacity>

        {/* existing edit/delete buttons*/}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateRoutine', { routine: item })}
            style={[styles.smallBtn, { borderColor: theme.borderColor }]}
          >
            <Text style={{ color: theme.textColor }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.smallBtn, styles.danger, { borderColor: '#e74c3c' }]}
          >
            <Text style={{ color: 'white' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  addButton: { backgroundColor: '#2f80ed', padding: 12, borderRadius: 8, alignItems:'center', marginBottom:12 },
  addText: { color: 'white', fontWeight: '600' },
  card: { padding: 12, borderRadius: 8, marginBottom: 10 },
  routineName: { fontSize: 16, fontWeight: '700' },
  meta: { marginTop: 6 },
  row: { flexDirection:'row', justifyContent:'flex-end', marginTop:10 },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  danger: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
});
