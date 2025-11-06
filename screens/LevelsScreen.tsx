import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const LEVELS = [
  {
    title: 'Level 1 — Seedling',
    description: 'You\'re just beginning your relaxation journey. Focus on forming small daily habits.',
  },
  {
    title: 'Level 2 — Sprout',
    description: 'Consistency is growing! Keep up your streaks to strengthen your routines.',
  },
  {
    title: 'Level 3 — Bloom',
    description: 'You\'re flourishing. Experiment with new relaxation techniques to stay inspired.',
  },
  {
    title: 'Level 4 — Grove Guardian',
    description: 'You\'re a role model of calm. Share tips and help others cultivate their own habits.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

const LevelsScreen: React.FC<Props> = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Relax Mode Levels</Text>
      <Text style={styles.subtitle}>
        Advance through levels as you maintain your daily relaxation streaks.
      </Text>

      {LEVELS.map((level) => (
        <View key={level.title} style={styles.card}>
          <Text style={styles.levelTitle}>{level.title}</Text>
          <Text style={styles.levelDescription}>{level.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  levelDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default LevelsScreen;
