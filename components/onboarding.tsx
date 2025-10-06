import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Green = '#30BE63';
const Blue = '#4A90E2';
const Orange = '#FF8C00';
const Purple = '#8E44AD';

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to CropGuard',
    subtitle: 'Plant Disease Detection Made Easy',
    description: 'AI-powered technology to identify and diagnose plant diseases instantly using your smartphone camera.',
    backgroundColor: Blue,
    iconName: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 2,
    title: 'Scan & Analyze',
    subtitle: 'Quick Disease Detection',
    description: 'Simply point your camera at the affected plant parts and get instant analysis with detailed information.',
    backgroundColor: Green,
    iconName: 'scan' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 3,
    title: 'Expert Recommendations',
    subtitle: 'Personalized Treatment Plans',
    description: 'Receive customized treatment recommendations and preventive measures based on your specific findings.',
    backgroundColor: Orange,
    iconName: 'medical-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 4,
    title: 'Track Your Progress',
    subtitle: 'Monitor Plant Health',
    description: 'Keep track of your plant health history and monitor improvement with our comprehensive analytics.',
    backgroundColor: Purple,
    iconName: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Set navigation bar style for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setStyle('light');
    }
  }, []);

  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/auth' as any);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/auth' as any);
  };

  const goToSlide = (index: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentSlide(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const currentSlideData = onboardingData[currentSlide];

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: currentSlideData.backgroundColor }]}>
        <StatusBar 
          barStyle="light-content" 
          translucent={true}
        />
        
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding} activeOpacity={1}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.imageContainer}>
            <View style={styles.heroIconBackground}>
              <Ionicons name={currentSlideData.iconName} size={100} color="#fff" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentSlideData.title}</Text>
            <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
            <Text style={styles.description}>{currentSlideData.description}</Text>
          </View>
        </Animated.View>

        <View style={styles.bottomContainer}>
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  currentSlide === index && styles.activeIndicator,
                ]}
                onPress={() => goToSlide(index)}
                activeOpacity={0.7}
              />
            ))}
          </View>

          <View style={[styles.navigationContainer, styles.navigationRight]}>
            <TouchableOpacity 
              style={styles.nextButtonCentered}
              onPress={nextSlide}
              activeOpacity={1}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  heroIconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 30,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationRight: {
    justifyContent: 'flex-end',
  },
  nextButtonCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 160,
    gap: 8,
  },
  nextButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
