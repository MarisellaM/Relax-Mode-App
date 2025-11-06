//Create levels screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import load daily quest data to track progress


//connect to home button levels
import { RootStackParamList } from '../navigation/RootNavigator';

import { Image } from 'expo-image';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;
const LevelsScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Image 
                source={require('../assets/images/achievement.png')}
                style={{ width: 150, height: 150, marginBottom: 20 }}
                contentFit="contain"
            />
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>Track your progress and unlock new levels as you complete more quests!</Text> 
           
            //Display Level bar component
            <LevelBar level={1} progress={0} />
        </View>
    );
};
//Create the level bar that updates based on quests and will take this data from daily quest screen
type LevelBarProps = {
    level: LevelNumber;
    progress: ProgressNumber; // progress towards next level (0-100)
};
const LevelBar: React.FC<LevelBarProps> = ({ level, progress }) => {
    return (
        <View style={{ width: '100%', padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Level {level}</Text>
            <View style={{ height: 20, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 10 }}>
                <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#76c7c0', borderRadius: 10 }} />
            </View>
        </View>
    );
}

// level number based on quest completion from daily quest screen
// level 1 = 0-2 quests completed

//level 2 = 3-6 quests completed
// level 3 = 7-10 quests completed
// level 4 = 11-15 quests completed
// progress percentage based on quests completed towards next level


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
});

export default LevelsScreen;
    