

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  duration: number; // in seconds
  onComplete?: () => void;
  isRunning: boolean;
};

const CountdownTimer: React.FC<Props> = ({ duration, onComplete, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const intervalRef = useRef<any | null>(null);

  useEffect(() => {
    // reset when duration changes
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      // Clear any existing interval
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => onComplete?.(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2f80ed',
  },
});

export default CountdownTimer;
