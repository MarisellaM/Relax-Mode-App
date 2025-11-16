import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';
import { useTheme } from '../lib/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>

      <Image 
        source={require('../assets/images/icon.png')}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        contentFit="contain"
      />

      <Text style={[styles.title, { color: theme.textColor }]}> Welcome to Relax Mode </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>A simple base to our app.</Text>

      <CustomButton
        title="Daily Quest"
        onPress={() => navigation.navigate('DailyQuest')}
      />

      <CustomButton 
        title="My Routines" 
        onPress={() => navigation.navigate('Routines')} 
      />
      
      <CustomButton 
        title="Automation" 
        onPress={() => navigation.navigate('Automation')} 
      />

      <CustomButton 
        title="Analytics" 
        onPress={() => navigation.navigate('Analytics')} 
      />

      <CustomButton
        title="Start Relaxation"
        onPress={() => navigation.navigate('Relaxation')}
      />
    <CustomButton
        title="Levels"
        onPress={() => navigation.navigate('Levels')}
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
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default HomeScreen; 
