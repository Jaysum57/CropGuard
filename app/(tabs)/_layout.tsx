import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Added Supabase and Session Imports ---
import { supabase } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js'; 

// Removed the import for './account' since it's now loaded by file convention

const Green = '#30BE63';
const OffWhite = '#F6F6F6';
const DarkGreen = '#021a09ff';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { Route } from '@react-navigation/native';

// --- 1. DEFINE SESSION CONTEXT ---
interface SessionContextType {
  session: Session | null;
  isLoading: boolean; // Indicates if the initial auth check is still running
}

export const SessionContext = React.createContext<SessionContextType>({
    session: null,
    isLoading: true, 
});
// --- END CONTEXT DEFINITION ---


const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBackground}>
        {state.routes.map((route: Route<string>, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as any); // Use 'as any' if necessary for type safety in native
            }
          };

          // Define icons and labels
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          let activeIconName: keyof typeof Ionicons.glyphMap = 'home';
          let displayLabel = '';

          if (label === 'Home') {
            iconName = 'home-outline';
            activeIconName = 'home';
            displayLabel = 'Home';
          } else if (label === 'Scan') {
            iconName = 'scan-outline';
            activeIconName = 'scan';
            displayLabel = 'Scan';
          } else if (label === 'Account') {
            iconName = 'person-outline';
            activeIconName = 'person';
            displayLabel = 'Profile';
          }

          // Skip hidden routes
          if (
            [
              '_sitemap',
              '+not-found',
              'information',
              'splashscreen',
              'usermanual',
            ].includes(route.name) || route.name.startsWith('details')
          ) {
            return null;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.modernTab, isFocused && styles.modernTabActive]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              activeOpacity={0.7}
            >
              {isFocused && <View style={styles.activeIndicator} />}
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                <Ionicons
                  name={isFocused ? activeIconName : iconName}
                  size={isFocused ? 26 : 24}
                  color={isFocused ? '#fff' : '#666'}
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};


export default function TabsLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // 1. Get initial session status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingInitial(false);
    });

    // 2. Set up real-time listener for session changes (login/logout/token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // 3. Cleanup the listener on unmount
    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // If we are still checking the initial session, show a loading screen across all tabs
  if (loadingInitial) {
    return (
      <View style={styles.initialLoadingContainer}>
        <Text style={{ fontSize: 18, color: DarkGreen }}>Initializing App...</Text>
      </View>
    );
  }

  return (
    // --- 2. WRAP TABS WITH SESSION CONTEXT PROVIDER ---
    <SessionContext.Provider value={{ session, isLoading: loadingInitial }}>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            headerStyle: {
              backgroundColor: OffWhite,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
          {/* FIX: Use file-based routing and let the Account screen consume the context */}
          <Tabs.Screen 
              name="account" 
              options={{ title: 'Account' }}
              // component prop removed to resolve TypeScript error
          />

        </Tabs>
      </View>
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Added for initial loading screen
  initialLoadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: OffWhite,
  },
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 25,
    borderRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(48, 190, 99, 0.1)',
  },
  modernTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 64,
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  modernTabActive: {
    backgroundColor: Green,
    transform: [{ scale: 1.05 }],
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 40,
    height: 3,
    backgroundColor: DarkGreen,
    borderRadius: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    // backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Keep old styles for backward compatibility
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
