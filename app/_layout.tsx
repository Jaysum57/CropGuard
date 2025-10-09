import { Stack } from 'expo-router';
import React from 'react';
import AppStateProvider, { useAppState } from '../components/AppStateProvider';
import OnboardingScreen from '../components/onboarding';

const AppContent = () => {
  const { hasSeenOnboarding } = useAppState();

  // Show onboarding if user hasn't seen it yet
  if (!hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  // Show main app with stack navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
