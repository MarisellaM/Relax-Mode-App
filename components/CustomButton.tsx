
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  secondary?: boolean;
};

const CustomButton: React.FC<Props> = ({ title, onPress, secondary = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, secondary ? styles.secondaryButton : styles.primaryButton]}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '80%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2f80ed',
  },
  secondaryButton: {
    backgroundColor: '#efefef',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#333',
  },
});

export default CustomButton;
