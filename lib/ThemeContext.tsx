import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'appTheme';

export const lightTheme = {
  backgroundColor: '#FEF9E7',
  textColor: '#2C3E50',
  secondaryTextColor: '#7F8C8D',
  placeholderTextColor: '#8E9A9C',
  borderColor: '#D6DBDF',
  cardBackground: '#FFFFFF',
  isDark: false,
};

export const darkTheme = {
  backgroundColor: '#1B2631',
  textColor: '#ECF0F1',
  secondaryTextColor: '#BDC3C7',
  placeholderTextColor: '#E6ECEE',
  borderColor: '#34495E',
  cardBackground: '#2C3E50',
  isDark: true,
};

export type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        console.log('[ThemeContext] Loaded theme from storage:', savedTheme);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setIsDarkMode(savedTheme === 'dark');
          console.log('[ThemeContext] Set dark mode to:', savedTheme === 'dark');
        }
      } catch (e) {
        console.error('[ThemeContext] Failed to load theme preference', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    const themeValue = newValue ? 'dark' : 'light';
    console.log('[ThemeContext] Toggling theme to:', themeValue);

    // Update state immediately for responsive UI
    setIsDarkMode(newValue);

    try {
      // Save to storage
      await AsyncStorage.setItem(THEME_KEY, themeValue);
      console.log('[ThemeContext] Saved theme to storage:', themeValue);

      // Double-check it was saved correctly
      const verify = await AsyncStorage.getItem(THEME_KEY);
      console.log('[ThemeContext] Verification read:', verify);

      if (verify !== themeValue) {
        console.error('[ThemeContext] Storage verification failed! Expected:', themeValue, 'Got:', verify);
        // If verification fails, reload from storage
        setIsDarkMode(verify === 'dark');
      }
    } catch (e) {
      console.error('[ThemeContext] Failed to save theme preference:', e);
      // On error, revert the state
      setIsDarkMode(!newValue);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
