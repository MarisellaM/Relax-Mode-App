import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/ThemeContext';

const SOUND_EFFECTS_KEY = 'soundEffectsEnabled';

const SettingsScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);

  // Load sound effects preference on mount
  useEffect(() => {
    const loadSoundEffects = async () => {
      try {
        const saved = await AsyncStorage.getItem(SOUND_EFFECTS_KEY);
        if (saved !== null) {
          setSoundEffectsEnabled(JSON.parse(saved));
        }
      } catch (e) {
        console.error('[Settings] Failed to load sound effects preference', e);
      }
    };

    loadSoundEffects();
  }, []);

  const handleSoundEffectsToggle = async (value: boolean) => {
    setSoundEffectsEnabled(value);

    try {
      await AsyncStorage.setItem(SOUND_EFFECTS_KEY, JSON.stringify(value));
      console.log('[Settings] Sound effects set to:', value);
    } catch (e) {
      console.error('[Settings] Failed to save sound effects preference:', e);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textColor }]}>Settings</Text>

        <View style={[styles.settingRow, { borderBottomColor: theme.borderColor }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryTextColor }]}>
              Switch between light and dark theme
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#2f80ed' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.borderColor }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textColor }]}>
              Sound Effects
            </Text>
            <Text style={[styles.settingDescription, { color: theme.secondaryTextColor }]}>
              Enable or disable sound effects in the app
            </Text>
          </View>
          <Switch
            value={soundEffectsEnabled}
            onValueChange={handleSoundEffectsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundEffectsEnabled ? '#2f80ed' : '#f4f3f4'}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
});

export default SettingsScreen;