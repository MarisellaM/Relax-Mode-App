import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from '../navigation/RootNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../lib/ThemeContext';
import { loadStats } from '../lib/storage/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'Analytics'>;

type LogEntry = {
  id: string;
  type: "clean" | "relax";
  timestamp: number;
};

const LOG_KEY = "logEntries";

export default function AnalyticsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [cleanCount, setCleanCount] = useState(0);
  const [relaxCount, setRelaxCount] = useState(0);
  const [statsSummary, setStatsSummary] = useState<string | null>(null);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      loadAnalytics();
      loadStatsSummary();
    });
    loadAnalytics();
    loadStatsSummary();
    return unsub;
  }, [navigation]);

  const loadStatsSummary = async () => {
  try {
    const s = await loadStats();
    console.log('[Analytics] loadStats summary:', s);
    const text = `Relax: ${s.totalRelaxMinutes} min · Cleaning: ${s.totalCleaningMinutes} min · Weekly streaks: ${s.weeklyStreaksCompleted}`;
    setStatsSummary(text);
  } catch (e) {
    console.warn('Failed to load stats summary', e);
  }
};

  const loadAnalytics = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOG_KEY);
      const parsed: LogEntry[] = raw ? JSON.parse(raw) : [];

      setEntries(parsed);
      setCleanCount(parsed.filter(e => e.type === "clean").length);
      setRelaxCount(parsed.filter(e => e.type === "relax").length);

    } catch (e) {
      console.warn("Failed to load analytics", e);
    }
  };

  const total = cleanCount + relaxCount;

  const insight = (() => {
    if (total === 0) return "No data yet — complete a quest to get insights!";
    if (cleanCount > relaxCount) return "You clean more often than you relax. Consider balancing your day!";
    if (relaxCount > cleanCount) return "Great job relaxing — keep managing your stress!";
    return "Nice balance between cleaning and relaxation!";
  })();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>Your Analytics</Text>
      <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>Track your habits over time</Text>

      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.cardLabel, { color: theme.secondaryTextColor }]}>Total Activity</Text>
        <Text style={[styles.cardValue, { color: theme.textColor }]}>{total}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.cardSmall, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardLabel, { color: theme.secondaryTextColor }]}>Cleaning</Text>
          <Text style={[styles.cardValue, { color: theme.textColor }]}>{cleanCount}</Text>
        </View>

        <View style={[styles.cardSmall, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardLabel, { color: theme.secondaryTextColor }]}>Relaxing</Text>
          <Text style={[styles.cardValue, { color: theme.textColor }]}>{relaxCount}</Text>
        </View>
      </View>

{statsSummary && (
  <View style={[styles.card, { marginTop: 10, backgroundColor: theme.cardBackground }]}>
    <Text style={[styles.cardLabel, { color: theme.secondaryTextColor }]}>
      Overall Stats
    </Text>
    <Text style={{ marginTop: 6, color: theme.textColor }}>
      {statsSummary}
    </Text>
  </View>
)}

<Text style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
  Cleaning and relaxation sessions are tracked from Relaxation Mode and Daily Quest.
</Text>

      <View style={styles.insightBox}>
        <Text style={styles.insightTitle}>Insight</Text>
        <Text style={[styles.insightText, { color: theme.textColor }]}>{insight}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSmall: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "48%",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: { fontSize: 16 },
  cardValue: { fontSize: 32, fontWeight: "700", marginTop: 5 },
  insightBox: {
    backgroundColor: "#e0f2fe",
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  insightText: { fontSize: 16 },
});
