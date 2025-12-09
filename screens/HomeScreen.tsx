import React, {useRef, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import CustomButton from '../components/CustomButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Image } from 'expo-image';
import { useTheme } from '../lib/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;


const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();

// Making things glow 
const glowAnim = useRef(new Animated.Value(0.8)).current;
const pressAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1.15,
        duration: 1400,
        useNativeDriver: true,  
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    ])
  ).start();
},[]);


const handlePressIn = () => {
  Animated.timing(pressAnim, {
    toValue: 0.92,
    duration: 120,
    useNativeDriver: true,
  }).start(() => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  });
};

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>

      <Image 
        source={require('../assets/images/icon.png')}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        contentFit="contain"
      />

 
      <Text style={[styles.subtitle, { fontSize: 25, color: theme.textColor }]}>Welcome to</Text>
      
      <Image 
        source={require('../assets/images/AppName.png')}
        style={{ width: 300, height: 80, marginBottom: 12, marginTop: -30 }}
        contentFit="contain"
      />
  <View style={styles.row}>
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity onPressIn={handlePressIn} onPress={() => navigation.navigate('DailyQuest')}>
          <Image
            source={require('../assets/images/Levels.png')}
            style={{ width: 160, height: 140 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity onPressIn={handlePressIn} onPress={() => navigation.navigate('Relaxation')}>
          <Image
            source={require('../assets/images/Relax.png')}
            style={{ width: 260, height: 140 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </Animated.View>
  </View>

  <View style={styles.row}>
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity onPressIn={handlePressIn} onPress={() => navigation.navigate('Routines')}>
          <Image
            source={require('../assets/images/Rout.png')}
            style={{ width: 160, height: 140 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity onPressIn={handlePressIn} onPress={() => navigation.navigate('Settings')}>
          <Image
            source={require('../assets/images/Settings.png')}
            style={{ width: 260, height: 140 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </Animated.View>
  </View>

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
  row: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '90%',
  marginVertical: 30,
  },

  icon: {
    width: 160,
    height: 120,
  },
});

export default HomeScreen; 
