import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const Green = '#30BE63';

interface AppState {
  isLoading: boolean;
  hasSeenOnboarding: boolean;
}

const AppStateContext = React.createContext<AppState>({
  isLoading: true,
  hasSeenOnboarding: false,
});

export const useAppState = () => React.useContext(AppStateContext);

interface AppStateProviderProps {
  children: React.ReactNode;
}

function AppStateProvider({ children }: AppStateProviderProps) {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    hasSeenOnboarding: false,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      setAppState({
        isLoading: false,
        hasSeenOnboarding: hasSeenOnboarding === 'true',
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setAppState({
        isLoading: false,
        hasSeenOnboarding: false,
      });
    }
  };

  // Show loading screen while checking onboarding status
  if (appState.isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F6F6F6' 
      }}>
        <ActivityIndicator size="large" color={Green} />
      </View>
    );
  }

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
}

export default AppStateProvider;
export { AppStateProvider };

// Export methods to manage onboarding state
export const OnboardingManager = {
  async markOnboardingComplete() {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  },
  
  async resetOnboarding() {
    await AsyncStorage.removeItem('hasSeenOnboarding');
  },
  
  async hasSeenOnboarding() {
    const value = await AsyncStorage.getItem('hasSeenOnboarding');
    return value === 'true';
  }
};