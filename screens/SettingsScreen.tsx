import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚙️ not implemented</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
  },
  text: {
    fontSize: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default SettingsScreen;