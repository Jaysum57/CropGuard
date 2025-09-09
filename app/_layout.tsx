import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const Green = '#30BE63';
const OffWhite = '#F6F6F6';
const DarkGreen = '#021A1A';

const _layout = () => {
  const router = useRouter();

  return (
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
        <Tabs.Screen name="account" options={{ title: 'Account' }} />
      </Tabs>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
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
            navigation.navigate(route.name);
          }
        };

        // Define icons
        let iconName;
        if (label === 'Home') iconName = 'home-outline';
        else if (label === 'Scan') iconName = 'scan-outline';
        else if (label === 'Account') iconName = 'person-outline';

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
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          >
            <Ionicons
              name={iconName}
              size={28}
              color={isFocused ? DarkGreen : Green}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // No background color
  },
  tabBarContainer: {
    position: 'absolute', 
    left: 0,
    right: 0,
    bottom: 35, // Distance from bottom
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: OffWhite,
    borderRadius: 30,
    marginHorizontal: 30,
    marginBottom: 0, 
    paddingVertical: 12,
    elevation: 8, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default _layout;
