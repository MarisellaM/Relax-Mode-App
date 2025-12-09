
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RelaxationScreen from '../screens/RelaxationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DailyQuestScreen from '../screens/DailyQuestScreen';
import RoutinesScreen from '../screens/RoutinesScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';
import levels from '../screens/levels';
import AnalyticsScreen from '../screens/AnalyticsScreen'
import RoutineTrackerScreen from '../screens/routinesTracker';

export type RootStackParamList = {
  Home: undefined;
  Relaxation: undefined;
  Settings: undefined;
  DailyQuest: undefined;
  Routines: undefined;
  CreateRoutine: { routine?: any } | undefined;
  Automation: undefined;
  Levels: undefined;
  RoutineTracker: { routineId: string };
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
      <Stack.Screen name="Routines" component={RoutinesScreen} options={{ title: 'My Routines' }} />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} options={{ title: 'Create Routine' }} />
      <Stack.Screen name="Levels" component={levels} options={{ title: 'Achievements' }} />
      <Stack.Screen name="RoutineTracker" component={RoutineTrackerScreen} options={{ title: 'Routine Path' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      </Stack.Navigator>
  );
};

export default RootNavigator;