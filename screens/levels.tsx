/*Create levels screen*/
/*  The user enables "Relaxation Automation" so the app can automatically remind them of cleaning/relaxation through notifications
  They can view their analytics to see time spent relaxing and time spent cleaning
  App can provide suggestions based on habits such as "You've cleaned 5 days straight, time to rest for a day."
*/
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
/* import load daily quest data to track progress*/
import AsyncStorage from '@react-native-async-storage/async-storage';

/*connect to home button levels*/
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';

// --- Type Definitions ---
type LevelNumber = number;
type ProgressNumber = number;
type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

type LevelBarProps = {
  level: LevelNumber;
  progress: ProgressNumber; /* progress towards next level (0-100)*/
};

type AnalyticsSectionProps = {
  navigateToAnalytics: () => void;
  provideSuggestions: () => void;
};

// --- Utility Functions ---

/**
 * Map total completed quests -> { level, progress to next (% 0-100) }
 */
function computeLevel(completed: number): { level: LevelNumber; progress: ProgressNumber } {
  if (completed <= 2) {
    const start = 0, size = 3;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 1, progress: Math.round(pct) };
  }
  if (completed <= 6) {
    const start = 3, size = 4;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 2, progress: Math.round(pct) };
  }
  if (completed <= 10) {
    const start = 7, size = 4;
    const pct = Math.min(100, Math.max(0, ((completed - start) / size) * 100));
    return { level: 3, progress: Math.round(pct) };
  }
  const start = 11, size = 5;
  const pct = Math.min(100, Math.max(0, ((Math.min(completed, 15) - start) / size) * 100));
  return { level: 4, progress: Math.round(pct) };
}

/*  The user enables "Relaxation Automation" so the app can automatically remind them of cleaning/relaxation through notifications */
function relaxationAutomation() {
  Alert.alert('Automation Enabled', 'Relaxation Automation is now active! You will receive a test notification shortly.');
} 

// --- Sub-Components (Defined before LevelsScreen) ---

const LevelBar: React.FC<LevelBarProps> = ({ level, progress }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={{ width: '100%', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Level {level}</Text>
      <View style={{ height: 20, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 10 }}>
        <View
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: '#76c7c0',
            borderRadius: 10,
          }}
        />
      </View>
    </View>
  );
}
 
const RelaxationAutomationSection: React.FC = () => (
  <View style={styles.featureBox}>
    <Text style={styles.featureTitle}>Relaxation Automation</Text>
    <Text style={styles.featureDesc}>
      Enable the app to automatically remind you of cleaning/relaxation through notifications based on your habits.
    </Text>
    <Pressable style={styles.button} onPress={relaxationAutomation}>
      <Text style={styles.buttonText}>Enable Automation</Text>
    </Pressable>
  </View>
);

const AnalyticsAndSuggestionsSection: React.FC<AnalyticsSectionProps> = ({navigateToAnalytics, provideSuggestions}) => (
  <View style={styles.featureBox}>
    <Text style={styles.featureTitle}>Analytics & Suggestions</Text>
    <Text style={styles.featureDesc}>
      View your time spent relaxing/cleaning and get personalized habit suggestions.
    </Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 }}>
      <Pressable style={styles.button} onPress={navigateToAnalytics}>
        <Text style={styles.buttonText}>View Analytics</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={provideSuggestions}>
        <Text style={styles.buttonText}>Get Suggestion</Text>
      </Pressable>
    </View>
  </View>
);


// --- Main Screen Component ---
const LevelsScreen: React.FC<Props> = ({navigation}) => {
  const [completed, setCompleted] = useState<number>(0);
  const { level, progress } = computeLevel(completed);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('completedQuests');
      setCompleted(raw ? JSON.parse(raw) as number : 0);
    })();
  }, []);

  // Function to handle navigation to the Analytics screen
  const navigateToAnalytics = () => {
    // NOTE: 'Analytics' must be defined in RootStackParamList in RootNavigator.tsx
    navigation.navigate('Analytics'); 
  };
  
  /* Function to provide a suggestion (called by the button) */
  function provideSuggestions(): void {
    Alert.alert('Suggestion', "You've cleaned 5 days straight, time to rest for a day.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/images/achievement.png')}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        contentFit="contain"
      />
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        Track your progress and unlock new levels as you complete more quests!
      </Text>

      {/* Display Level bar component */}
      <LevelBar level={level} progress={progress} />

      <Text style={{ marginTop: 12, color: '#555' }}>
        Completed quests: {completed}
      </Text>

      {/* Feature Sections */}
      <RelaxationAutomationSection />
      <AnalyticsAndSuggestionsSection 
        navigateToAnalytics={navigateToAnalytics} 
        provideSuggestions={provideSuggestions}
      />

    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start', // Adjusted to start content from the top
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 50, // Added padding at the top
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  featureBox: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50', /* Green */
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginHorizontal: 5, // Added margin for spacing between buttons
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
 },
});

export default LevelsScreen;