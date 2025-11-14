
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RelaxationScreen from '../screens/RelaxationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DailyQuestScreen from '../screens/DailyQuestScreen';
import levels from '../screens/levels';
import AnalyticsScreen from '../screens/AnalyticsScreen'

export type RootStackParamList = {
  Home: undefined;
  Relaxation: undefined;
  Settings: undefined;
  DailyQuest: undefined;
  Levels: undefined;
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Relax Mode' }} />
      <Stack.Screen name="Relaxation" component={RelaxationScreen} options={{ title: 'Relaxation' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="DailyQuest" component={DailyQuestScreen} options={{ title: 'Daily Quest' }}/>
      <Stack.Screen name="Levels" component={levels} options={{ title: 'Achievements' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      </Stack.Navigator>
  );
};

export default RootNavigator;