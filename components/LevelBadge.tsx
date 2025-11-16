
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { level: number; xp: number };

export default function LevelBadge({ level, xp }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.level}>Lv {level}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.xp}>XP: {xp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F6C85F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  level: { fontWeight: '700', fontSize: 16 },
  info: {},
  xp: { color: '#333' },
});
