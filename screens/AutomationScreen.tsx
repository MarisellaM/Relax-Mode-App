
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../lib/ThemeContext';

const AutomationScreen: React.FC = () => {
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [scene, setScene] = useState<'normal' | 'dim' | 'ambient'>('dim');

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>Relaxation Automation</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textColor }]}>Enable Automation</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Preview Scene</Text>
      <View style={styles.sceneRow}>
        {(['normal', 'dim', 'ambient'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setScene(s)}
            style={[
              styles.sceneButton,
              scene === s && styles.sceneButtonActive,
            ]}
          >
            <Text>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.previewBox,
          scene === 'dim'
            ? { backgroundColor: '#111' }
            : scene === 'ambient'
            ? { backgroundColor: '#7fc8a9' }
            : { backgroundColor: '#fff' },
        ]}
      >
        <Text style={{ color: scene === 'dim' ? '#fff' : '#111' }}>
          This is a visual preview of your relaxation scene.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  sceneRow: { flexDirection: 'row', marginBottom: 16 },
  sceneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sceneButtonActive: { backgroundColor: '#cfe1ff' },
  previewBox: {
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AutomationScreen;
