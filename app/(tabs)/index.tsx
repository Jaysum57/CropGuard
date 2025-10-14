import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllDiseases } from "../../components/DiseaseData";
import { eventEmitter, EVENTS } from '../../lib/eventEmitter';
import { profileCache } from '../../lib/profileCache';
import { supabase } from '../../lib/supabase';
import { SessionContext } from './_layout';

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.7;
const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";

// Define the structure for the profile data we will fetch
interface Profile {
  first_name: string | null;
  username: string | null;
}

// Define the structure for fetched statistics of disease data
interface UserStats {
  plantsScanned: number;
  lastScan: string | null; 
}

interface Disease {
  title: string;
  description: string;
  image: string;
  page: Href;
  tag: string;
  severity: "Low" | "Medium" | "High";
  color: string;
}

const severityColors: Record<Disease['severity'], string> = {
  Low: "#38A169",    // Green
  Medium: "#FF8C00", // Orange
  High: "#E53E3E",   // Red
};

const quickActions = [
  {
    title: "Scan Plant",
    description: "Take a photo to identify diseases",
    icon: "camera" as const,
    color: Green,
    route: "/scan" as const,
  },
  {
    title: "Disease Library",
    description: "Browse common plant diseases",
    icon: "library" as const,
    color: "#8B5CF6",
    route: "/details/diseaseLibrary" as const,
  },
];

// Helper function to format last scan time as relative time (minutes, hours, or days ago).
function formatLastScanTime(timestamp: string | undefined): { relativeTime: string, fullDate: string } {
    if (!timestamp || timestamp === "Never") {
        return { relativeTime: "Never", fullDate: "" };
    }

    const scanDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - scanDate.getTime()) / 1000);
    
    // Fallback: full date string (e.g., Oct 14, 2025)
    const fullDate = diffInSeconds >= 86400 ? scanDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    }) : '';

    let relativeTime: string;

    if (diffInSeconds < 60) {
        // Less than 1 minute
        relativeTime = "Just now";
    } else if (diffInSeconds < 3600) {
        // Less than 1 hour (minutes)
        const minutes = Math.floor(diffInSeconds / 60);
        relativeTime = `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffInSeconds < 86400) {
        // Less than 24 hours (hours)
        const hours = Math.floor(diffInSeconds / 3600);
        relativeTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        // 24 hours or more (days)
        const days = Math.floor(diffInSeconds / 86400);
        relativeTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    return { relativeTime, fullDate };
}

export default function Index() {
  // 1. Initialize all hooks at the top level
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useContext(SessionContext);
  
  // 2. All useState hooks together
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    plantsScanned: 0,
    lastScan: null,
  });
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [lastScanUpdateTrigger, setLastScanUpdateTrigger] = useState(0);

  /**
   * REFACTORED: Function to fetch aggregate scan statistics (Count & Last Scan Time)
   * This uses a more robust two-step Supabase query to ensure reliability even with zero logs.
   * @param userId - The user's ID
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   */
  async function getScanStats(userId: string, forceRefresh = false) {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedStats = profileCache.getStats(userId);
      if (cachedStats) {
        setStats({
          plantsScanned: cachedStats.plantsScanned,
          lastScan: cachedStats.healthyScans.toString(), // Note: This is a workaround, we'll need to adjust
        });
        // Note: The cached stats structure is different from what index.tsx uses
        // We're only caching plantsScanned here, not lastScan
        // For now, we'll still fetch from DB but this shows the cache pattern
      }
    }

    try {
      // 1. Get the total count of scans
      const { count, error: countError } = await supabase
        .from('scan_activity')
        .select('*', { head: true, count: 'exact' }) // Use head: true for count
        .eq('user_id', userId);

      if (countError) {
        console.error("Error fetching scan count:", countError.message);
        return;
      }
      
      let plantsScanned = count || 0;
      let lastScanTime: string | null = null;

      // 2. Get the last scan time (max timestamp) if there are any scans
      if (plantsScanned > 0) {
        // Fetch the single latest scan time
        const { data: latestData, error: latestError } = await supabase
          .from('scan_activity')
          .select('scanned_at')
          .eq('user_id', userId)
          .order('scanned_at', { ascending: false })
          .limit(1)
          .single(); // Since we use limit(1), single() is appropriate

        // Handle error, but skip the "No rows found" error (PGRST116) as it's unexpected here
        if (latestError && latestError.code !== 'PGRST116') {
          console.error("Error fetching last scan time:", latestError.message);
        } else if (latestData && latestData.scanned_at) {
          lastScanTime = latestData.scanned_at;
        }
      }

      setStats({
        plantsScanned: plantsScanned,
        lastScan: lastScanTime,
      });

      // Cache the stats (using the structure from account.tsx)
      // Note: This is a simplified version - ideally we'd create a separate cache structure for index stats
      profileCache.setStats(userId, {
        plantsScanned,
        diseasesDetected: 0, // Not used in index
        healthyScans: 0, // Not used in index
        accuracy: '0%', // Not used in index
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in getScanStats:", error.message);
      }
    }
  }


  /**
    * 4. Function to fetch the user's profile data
    * @param forceRefresh - If true, bypasses cache and fetches fresh data
    */
  async function getProfile(forceRefresh = false) {
      if (!session?.user) {
          setProfile(null);
          setLoadingProfile(false);
          return;
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
          const cachedProfile = profileCache.getProfile(session.user.id);
          if (cachedProfile) {
              // Map the cached profile to our simplified Profile interface
              setProfile({
                  first_name: cachedProfile.first_name,
                  username: cachedProfile.username,
              });
              setLoadingProfile(false);
              return;
          }
      }

      setLoadingProfile(true);
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select(`first_name, username`) 
              .eq('id', session.user.id)
              .single(); // Use single() since 'id' is a primary key

          if (error) {
              console.error("Error fetching profile for index:", error.message);
              setProfile(null);
              return;
          }

          // data will be the object if single() succeeds, or null if not found
          if (data) {
              const profileData = data as Profile;
              setProfile(profileData);
              
              // Cache the profile data (with the full structure expected by profileCache)
              profileCache.setProfile(session.user.id, {
                  first_name: profileData.first_name,
                  last_name: null, // Not fetched in index
                  username: profileData.username,
                  website: null, // Not fetched in index
                  avatar_url: null, // Not fetched in index
              });
          } else {
              setProfile(null);
          }
      } catch (error) {
          if (error instanceof Error) {
              console.error('Error in getProfile:', error.message);
              setProfile(null);
          }
      } finally {
          setLoadingProfile(false);
      }
  }

  // 5. Load profile data when the session changes
  useEffect(() => {
      // Only try to fetch if the session is not null
      if (session) {
          getProfile();
          getScanStats(session.user.id); // Fetch stats for the logged-in user
      } else {
          // If session is null (logged out), clear profile
          setProfile(null);
          setLoadingProfile(false);
          setStats({ plantsScanned: 0, lastScan: "Never" }); // Reset stats
      }
  }, [session]);

  // Fetch diseases when component mounts
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const diseaseData = await getAllDiseases();
        const mappedDiseases = diseaseData.map(disease => ({
          title: disease.name,
          description: disease.description,
          image: disease.image,
          page: `/details/${disease.id}` as Href,
          tag: disease.category.includes('Fungal') ? 'Fungal' : 
               disease.category.includes('Bacterial') ? 'Bacterial' : 'Other',
          severity: disease.severity,
          color: severityColors[disease.severity],
        }));
        setDiseases(mappedDiseases);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      }
    };

    fetchDiseases();
  }, []);

  // Listen for scan completion events and refresh stats
  useEffect(() => {
    const handleScanCompleted = () => {
      console.log('Index: Scan completed event received, refreshing stats...');
      if (session?.user) {
        // Invalidate stats cache and fetch fresh data
        profileCache.invalidateStats(session.user.id);
        getScanStats(session.user.id, true);
      }
    };

    eventEmitter.on(EVENTS.SCAN_COMPLETED, handleScanCompleted);

    return () => {
      eventEmitter.off(EVENTS.SCAN_COMPLETED, handleScanCompleted);
    };
  }, [session]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log('Index: Profile updated event received, refreshing profile...');
      if (session?.user) {
        // Invalidate profile cache and fetch fresh data
        profileCache.invalidateProfile(session.user.id);
        getProfile(true);
      }
    };

    eventEmitter.on(EVENTS.PROFILE_UPDATED, handleProfileUpdated);

    return () => {
      eventEmitter.off(EVENTS.PROFILE_UPDATED, handleProfileUpdated);
    };
  }, [session]);

  // Set up 1-minute timer to update "Last Scan" display
  useEffect(() => {
    // Update every 60 seconds to refresh relative time
    const intervalId = setInterval(() => {
      setLastScanUpdateTrigger(prev => prev + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  // 6. Determine the user's display name
  const userName = 
    profile?.first_name || 
    profile?.username || 
    session?.user.email?.split('@')[0] || // Use part of the email as a robust fallback
    (isSessionLoading || loadingProfile ? "Loading..." : "New User");


  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Modern Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              {/* 7. Use the dynamic userName */}
              <Text style={styles.userNameText}>{userName}! 👋</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/account")}>
              <Ionicons name="person-circle" size={40} color={Green} />
            </TouchableOpacity>
          </View>
          
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.plantsScanned}</Text> 
              <Text style={styles.statLabel}>Plants Scanned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.lastScan ? formatLastScanTime(stats.lastScan).relativeTime : "Never"}
              </Text>
              {stats.lastScan && formatLastScanTime(stats.lastScan).fullDate && (
                <Text style={styles.statDate}>
                  {formatLastScanTime(stats.lastScan).fullDate}
                </Text>
              )}
              <Text style={styles.statLabel}>Last Scan</Text>
            </View>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Protect Your Plants</Text>
            <Text style={styles.heroSubtitle}>
              Use AI-powered disease detection to keep your crops healthy and thriving
            </Text>
          </View>
          <View style={styles.heroIconContainer}>
            <Ionicons name="leaf" size={30} color={Green} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => router.push(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disease Library */}
        <View style={styles.diseaseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Common Plant Diseases</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push("/details/diseaseLibrary")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color={Green} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={diseases}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.diseaseCardsContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.diseaseCard}
                activeOpacity={0.9}
                onPress={() => router.push(item.page as Href)}
              >
                <View style={styles.diseaseImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.diseaseImage} />
                  ) : (
                    <View style={styles.diseaseImagePlaceholder}>
                      <Ionicons name="leaf" size={40} color={Green} />
                    </View>
                  )}
                  <View style={[styles.severityBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </View>
                
                <View style={styles.diseaseContent}>
                  <View style={styles.diseaseHeader}>
                    <Text style={styles.diseaseTitle}>{item.title}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: item.tag === "Fungal" ? "#FFF3CD" : "#E1F5FE" }]}>
                      <Text style={[styles.tagText, { 
                        color: item.tag === "Fungal" ? "#856404" : "#0277BD" 
                      }]}>{item.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.diseaseDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Plant Care Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={Yellow} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Prevention is Key</Text>
              <Text style={styles.tipText}>
                Regular monitoring and proper plant spacing can prevent most diseases from spreading.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 120,
    backgroundColor: "#fff",
  },

  // Header Section
  headerSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: DarkGreen,
  },
  profileButton: {
    padding: 4,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: OffWhite,
    // borderColor: "#E0E0E0",
    // borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Green,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statDate: {
    fontSize: 9,
    color: "#666",
    marginTop: -4,
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
  },

  // Hero Section
  heroSection: {
    backgroundColor: Green,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroContent: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 20,
  },
  heroIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 60,
    backgroundColor: OffWhite,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 16,
  },
  actionGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // Disease Section
  diseaseSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: OffWhite,
    borderRadius: 20,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: Green,
    fontWeight: "600",
    marginRight: 4,
  },
  diseaseCardsContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 12,
  },
  diseaseCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 16,
    width: CARD_WIDTH,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  diseaseImageContainer: {
    position: "relative",
    height: 140,
    backgroundColor: OffWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  diseaseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  diseaseImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: OffWhite,
  },
  severityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  diseaseContent: {
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    flex: 1,
    marginRight: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  diseaseDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Yellow,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 0,
  },
});
