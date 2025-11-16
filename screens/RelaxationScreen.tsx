import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RelaxationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Enter Relax Mode</Text>
    </View>
  );
};

/* Play a relaxing song or soundscape in the background */

// Clean Task - which shows up in anylitics
// Relax Task - which shows up in analytics

/* Change the color of a wyze light bulb to a calming color (a green or blue hue)*/
// Now change the screen color and play noise based on clean vs relax task type

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
  },
  text: {
    fontSize: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default RelaxationScreen;