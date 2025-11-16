
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>My Routines</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateRoutine')}>
        <Text style={styles.addText}>+ Create Routine</Text>
      </TouchableOpacity>

      <FlatList
        data={routines}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.routineName, { color: theme.textColor }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>
              Days: {item.days.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
            </Text>
            <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>Time: {item.time ?? '—'}</Text>

            <View style={styles.row}>
              <TouchableOpacity onPress={() => navigation.navigate('CreateRoutine', { routine: item })} style={styles.smallBtn}>
                <Text>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.smallBtn, styles.danger]}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20, color: theme.secondaryTextColor }}>No routines yet.</Text>}
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
  smallBtn: { padding:8, borderRadius:6, backgroundColor:'#eee', marginLeft:8 },
  danger: { backgroundColor: '#e74c3c' }
});
