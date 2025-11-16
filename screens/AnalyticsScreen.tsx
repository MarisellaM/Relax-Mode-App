import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from '../navigation/RootNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Analytics'>;

type LogEntry = {
  id: string;
  type: "clean" | "relax";
  timestamp: number;
};

const LOG_KEY = "logEntries";

export default function AnalyticsScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [cleanCount, setCleanCount] = useState(0);
  const [relaxCount, setRelaxCount] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Analytics</Text>
      <Text style={styles.subtitle}>Track your habits over time</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Activity</Text>
        <Text style={styles.cardValue}>{total}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>Cleaning</Text>
          <Text style={styles.cardValue}>{cleanCount}</Text>
        </View>

        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>Relaxing</Text>
          <Text style={styles.cardValue}>{relaxCount}</Text>
        </View>
      </View>

      <View style={styles.insightBox}>
        <Text style={styles.insightTitle}>Insight</Text>
        <Text style={styles.insightText}>{insight}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
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
    color: "#666",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#f3f4f6",
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
    backgroundColor: "#f3f4f6",
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
  cardLabel: { fontSize: 16, color: "#666" },
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
  insightText: { fontSize: 16, color: "#333" },
});
