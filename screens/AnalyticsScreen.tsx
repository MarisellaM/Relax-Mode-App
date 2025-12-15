import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from '../navigation/RootNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../lib/ThemeContext';
import { loadStats } from '../lib/storage/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalyticsScreen'>;

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

      {/* Main Total Activity Card with Gradient Effect */}
      <View style={[styles.heroCard, { backgroundColor: '#2f80ed' }]}>
        <Text style={styles.heroLabel}>Total Activity</Text>
        <Text style={styles.heroValue}>{total}</Text>
        <Text style={styles.heroSubtext}>sessions completed</Text>
      </View>

      {/* Cleaning and Relaxing Cards with Distinct Colors */}
      <View style={styles.row}>
        <View style={[styles.cardSmall, { backgroundColor: '#10b981', borderLeftWidth: 4, borderLeftColor: '#059669' }]}>
          <Text style={styles.iconEmoji}>🧹</Text>
          <Text style={styles.cardLabelWhite}>Cleaning</Text>
          <Text style={styles.cardValueWhite}>{cleanCount}</Text>
          <Text style={styles.cardSubtext}>sessions</Text>
        </View>

        <View style={[styles.cardSmall, { backgroundColor: '#8b5cf6', borderLeftWidth: 4, borderLeftColor: '#7c3aed' }]}>
          <Text style={styles.iconEmoji}>🧘</Text>
          <Text style={styles.cardLabelWhite}>Relaxing</Text>
          <Text style={styles.cardValueWhite}>{relaxCount}</Text>
          <Text style={styles.cardSubtext}>sessions</Text>
        </View>
      </View>

{statsSummary && (
  <View style={[styles.statsCard, { backgroundColor: theme.cardBackground, borderWidth: 2, borderColor: '#f59e0b' }]}>
    <View style={styles.statsHeader}>
      <Text style={styles.statsIcon}>📊</Text>
      <Text style={[styles.statsTitle, { color: theme.textColor }]}>
        Overall Stats
      </Text>
    </View>
    <View style={styles.statsList}>
      <View style={styles.statItem}>
        <Text style={styles.statEmoji}>🧘‍♀️</Text>
        <Text style={[styles.statText, { color: theme.textColor }]}>
          <Text style={styles.statNumber}>{statsSummary.split('·')[0].split(':')[1]?.trim()}</Text> relaxation
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statEmoji}>🧹</Text>
        <Text style={[styles.statText, { color: theme.textColor }]}>
          <Text style={styles.statNumber}>{statsSummary.split('·')[1].split(':')[1]?.trim()}</Text> cleaning
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statEmoji}>🔥</Text>
        <Text style={[styles.statText, { color: theme.textColor }]}>
          <Text style={styles.statNumber}>{statsSummary.split('·')[2].split(':')[1]?.trim()}</Text> weekly streaks
        </Text>
      </View>
    </View>
  </View>
)}

<Text style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
  Cleaning and relaxation sessions are tracked from Relaxation Mode and Daily Quest.
</Text>

      {/* Enhanced Insight Box */}
      <View style={[styles.insightBox, { backgroundColor: theme.cardBackground, borderLeftWidth: 6, borderLeftColor: '#06b6d4' }]}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={[styles.insightTitle, { color: theme.textColor }]}>Insight</Text>
        </View>
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
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  // Hero Card Styles
  heroCard: {
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: '#e0f2fe',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: "900",
    color: '#fff',
    marginVertical: 8,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: "500",
  },
  // Small Cards with Colors
  cardSmall: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  cardLabelWhite: {
    fontSize: 14,
    fontWeight: "600",
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.9,
  },
  cardValueWhite: {
    fontSize: 48,
    fontWeight: "900",
    color: '#fff',
    marginTop: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontWeight: "500",
  },
  // Stats Card
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsList: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  statText: {
    fontSize: 16,
    fontWeight: "500",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: '#2f80ed',
  },
  // Insight Box
  insightBox: {
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
});
