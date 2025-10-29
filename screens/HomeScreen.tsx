

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Relax Mode</Text>
      <Text style={styles.subtitle}>A simple base to our app.</Text>

      <CustomButton
        title="Daily Quest"
        onPress={() => navigation.navigate('DailyQuest')}
      />

      <CustomButton
        title="Start Relaxation"
        onPress={() => navigation.navigate('Relaxation')}
      />

      <CustomButton
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
        secondary
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default HomeScreen;


