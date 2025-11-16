import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/ThemeContext';

type LogEntry = {
  id: string;
  type: 'clean' | 'relax';
  timestamp: number;
};

const LOG_KEY = 'logEntries';

// Logging activity for AnalyticsScreen
async function logActivity(type: 'clean' | 'relax') {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    const parsed: LogEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: LogEntry = {
      id: `log-${Date.now()}`,
      type,
      timestamp: Date.now(),
    };
    const updated = [...parsed, newEntry];
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to log activity', e);
  }
}

const RelaxationScreen: React.FC = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'relax' | 'clean' | null>(null);

  // animated value that loops 0-1 for color interpolation
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // color shifting
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver:false,
        }),
      ])
    ).start();
  }, [anim]);

  const handleSelect = async (nextMode: 'relax' | 'clean') => {
    setMode(nextMode);
    await logActivity(nextMode);
  };

  const backgroundColor = anim.interpolate({
    inputRange: [0,1],
    outputRange:
      mode === 'clean'
        ? ['#FFFDE7', '#FFF3CD'] // warm light-yellows for cleaning
        : mode === 'relax'
        ? ['#E0F7FA', '#D1C4E9'] // cool teal/purple for relaxing
        : theme.isDark
        ? [theme.backgroundColor, theme.backgroundColor] // use theme background in dark mode
        : ['#F4F6F7', '#EBF5FB'], // neutral light colors when no mode chosen
  });

  const title =
    mode === 'relax'
      ? 'Relax Mode'
      : mode === 'clean'
      ? 'Clean Mode'
      : 'Relax or Clean?';

  const subtitle =
    mode === 'relax'
      ? 'Simulating calm smart lights and gentle sound.'
      : mode === 'clean'
      ? 'Simulating bright, energizing smart lights.'
      : 'Choose a scene to simulate smart lights and start session.';
  
  const statusText =
    mode === null
      ? 'Smart light simulation is idle.'
      : mode === 'relax'
      ? 'Simulating smart lights: Relax Mode'
      : 'Simulating smart lights: Clean Mode';

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textColor }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>{subtitle}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'relax' && styles.modeButtonActiveRelax,
            ]}
            onPress={() => handleSelect('relax')}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'relax' && styles.modeTextActive,
              ]}
            >
              Relax Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'clean' && styles.modeButtonActiveClean,
            ]}
            onPress={() => handleSelect('clean')}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'clean' && styles.modeTextActive,
              ]}
            >
              Clean Mode
            </Text>
          </TouchableOpacity>
        </View>

        {mode && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.textColor }]}>
              {mode === 'relax' ? 'Suggested Relaxation' : 'Suggested Cleaning'}
            </Text>
            <Text style={[styles.cardBody, { color: theme.textColor }]}>
              {mode === 'relax'
                ? 'Put your phone down for a moment, close your eyes, and match your breathing to the gentle light shifts.'
                : 'Pick one small spot (desk, counter, or nightstand) and clean along with the energizing light.'}
            </Text>
            <Text style={[styles.cardHint, { color: theme.secondaryTextColor }]}>
              This session has been added to your analytics.
            </Text>
          </View>
        )}
      </View>

      {/* status bar at bottom */}
      <View style={[styles.statusBar, { borderTopColor: theme.borderColor, backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.statusText, { color: theme.secondaryTextColor }]}>{statusText}</Text>
        <Text style={[styles.statusSub, { color: theme.secondaryTextColor }]}>
          (In the future, you would be able to control smart devices here)
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#ffffffaa',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#D6DBDF',
  },
  modeButtonActiveRelax: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  modeButtonActiveClean: {
    backgroundColor: '#f5b041',
    borderColor: '#d68910',
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    marginBottom: 10,
  },
  cardHint: {
    fontSize: 13,
    marginTop: 4,
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  statusText: {
    fontSize: 13,
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default RelaxationScreen;