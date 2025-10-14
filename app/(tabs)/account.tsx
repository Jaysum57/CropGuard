import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router'; // 1. Import useRouter
import React, { useContext, useEffect, useState } from "react";
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from '../../lib/supabase';

// Import SessionContext from the layout file
import { eventEmitter, EVENTS } from '../../lib/eventEmitter';
import { profileCache } from '../../lib/profileCache';
import { SessionContext } from './_layout';


// Responsive sizing
const { width } = Dimensions.get("window");

const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const LightGreen = "#E6F9EF";

// Define the structure for the profile data we will fetch
interface Profile {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    website: string | null;
    avatar_url: string | null;
}

// Define the structure for fetched statistics of disease data
interface UserStats {
    plantsScanned: number;
    diseasesDetected: number;
    healthyScans: number;
    accuracy: string; // e.g., "94%"
}

// Account component no longer needs the session prop, it uses Context
export default function Account() {
    
    // Initialize the router for navigation
    const router = useRouter(); // 2. Initialize the router
    
    // --- CONTEXT CONSUMPTION: Get session and loading state from context ---
    const { session, isLoading: isSessionLoading } = useContext(SessionContext);
    // --- END CONTEXT CONSUMPTION ---

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [userStats, setUserStats] = useState<UserStats>({ 
        plantsScanned: 0, 
        diseasesDetected: 0, 
        healthyScans: 0,
        accuracy: '0%' 
    });
    
    // Convert join date for display
    const joinDate = session?.user.created_at 
        ? new Date(session.user.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })
        : 'N/A';
    
    const getDisplayName = () => {
        const first = profile?.first_name;
        const last = profile?.last_name;

        if (first && last) return `${first} ${last}`;
        if (first) return first;
        if (last) return last;
        
        return profile?.username || 'New User';
    };

async function fetchUserStats(forceRefresh = false) {
    if (!session?.user) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        const cachedStats = profileCache.getStats(session.user.id);
        if (cachedStats) {
            setUserStats(cachedStats);
            return;
        }
    }

    try {
        // 1. Get TOTAL SCANS: Count all entries for the user
        const { count: totalCount, error: totalError } = await supabase
            .from('scan_activity')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
            
        if (totalError) throw totalError;

        // 2. Get HEALTHY SCANS: Count entries where 'disease_id' ends with 'healthy'
        const { count: healthyCount, error: healthyError } = await supabase
            .from('scan_activity')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .ilike('disease_id', '%healthy'); // The '%' acts as a wildcard

        if (healthyError) throw healthyError;

        // 3. Get average accuracy score
        const { data: accuracyData, error: accuracyError } = await supabase
            .from('scan_activity')
            .select('accuracy_score')
            .eq('user_id', session.user.id);

        if (accuracyError) throw accuracyError;
        
        // Calculate average accuracy
        const avgAccuracy = accuracyData?.length 
            ? (accuracyData.reduce((sum, item) => sum + (item.accuracy_score || 0), 0) / accuracyData.length)
            : 0;
        
        // 4. Calculate final stats
        const plantsScanned = totalCount || 0;
        const healthyScans = healthyCount || 0;
        const diseasesDetected = plantsScanned - healthyScans;

        const stats = {
            plantsScanned,
            healthyScans,
            diseasesDetected,
            accuracy: `${Math.round(avgAccuracy * 100)}%`
        };

        setUserStats(stats);
        
        // Cache the stats
        profileCache.setStats(session.user.id, stats);
        
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user stats:', error.message);
        }
    }
}


    /**
     * Fetches the user's profile data from the 'profiles' table.
     * @param forceRefresh - If true, bypasses cache and fetches fresh data
     */
    async function getProfile(forceRefresh = false) {
        if (!session?.user) {
            setLoadingProfile(false);
            return;
        }

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cachedProfile = profileCache.getProfile(session.user.id);
            if (cachedProfile) {
                setProfile(cachedProfile);
                setLoadingProfile(false);
                return;
            }
        }

        try {
            setLoadingProfile(true); 

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`first_name, last_name, username, website, avatar_url`) 
                .eq('id', session.user.id)
                .single();

            if (error && status !== 406) {
                // Status 406 often means the profile hasn't been created yet.
                throw error;
            }

            if (data) {
                const profileData = data as Profile;
                setProfile(profileData);
                // Cache the profile data
                profileCache.setProfile(session.user.id, profileData);
            } else {
                setProfile(null);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error fetching profile:', error.message);
            }
        } finally {
            setLoadingProfile(false);
        }
    }

    // Load profile data on component mount or when session changes
    useEffect(() => {
        console.log("Account Component: Session Status (via Context) ->", session ? 'Active' : 'Null/Expired');
        
        if (session) {
            getProfile();
            fetchUserStats();
        } else {
            setProfile(null);
            setLoadingProfile(false);
            setUserStats({ plantsScanned: 0, healthyScans: 0, diseasesDetected: 0, accuracy: '0%' }); // Reset stats on logout
        }
    }, [session]);

    // Listen for scan completion events and refresh stats
    useEffect(() => {
        const handleScanCompleted = () => {
            console.log('Account: Scan completed event received, refreshing stats...');
            if (session?.user) {
                // Invalidate stats cache and fetch fresh data
                profileCache.invalidateStats(session.user.id);
                fetchUserStats(true);
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
            console.log('Account: Profile updated event received, refreshing profile...');
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


    /**
     * Handle pull-to-refresh - fetches fresh data from database
     */
    const onRefresh = async () => {
        if (!session?.user) return;
        
        setRefreshing(true);
        console.log('🔄 Refreshing profile and stats...');
        
        try {
            // Fetch fresh data from database (bypassing cache)
            await Promise.all([
                getProfile(true),
                fetchUserStats(true)
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out of CropGuard?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) throw error;
                            console.log("User successfully signed out");
                            
                            // Clear profile cache on logout
                            if (session?.user) {
                                profileCache.invalidateUser(session.user.id);
                            }
                            
                            // Navigation will be handled automatically by the auth state listener in _layout.tsx
                            // No need for manual router.replace('/auth') here

                        } catch (error) {
                            console.error("Logout Error:", error);
                            Alert.alert("Logout Error", "Failed to sign out. Please try again.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleEditProfile = () => {
        // TODO: Navigate to edit profile screen
        // When profile is updated, emit PROFILE_UPDATED event:
        // eventEmitter.emit(EVENTS.PROFILE_UPDATED);
        Alert.alert("Feature", "Navigating to Edit Profile...");
    };

    const handleSettings = () => {
        Alert.alert("Feature", "Navigating to Settings...");
    };
    
    // 1. Show a basic loading indicator while profile data is being fetched, or if initial session check is running
    if (isSessionLoading || loadingProfile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: DarkGreen, fontSize: 18 }}>Loading Profile...</Text>
            </View>
        );
    }
    
    // 2. Since tabs layout now protects against unauthenticated access, 
    // we can safely assume session exists at this point
    if (!session) {
        // This should not happen due to tabs layout protection, but keeping as fallback
        return (
             <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
                <Text style={{ color: DarkGreen, fontSize: 18, textAlign: 'center' }}>
                    Loading authentication...
                </Text>
            </View>
        );
    }

    // Since we checked if session is null above, we can safely access session.user here.
    return (
        <View style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Green]} // Android
                        tintColor={Green} // iOS
                        title="Pull to refresh" // iOS
                        titleColor={DarkGreen} // iOS
                    />
                }
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileIconContainer}>
                        {/* Avatar Image Placeholder */}
                        <Ionicons name="person" size={40} color={Green} />
                    </View>
                    {/* Display actual full name or username */}
                    <Text style={styles.userName}>{getDisplayName()}</Text>
                    <Text style={styles.userEmail}>{session.user.email}</Text>
                    <Text style={styles.joinDate}>Member since {joinDate}</Text>
                </View>

                {/* Statistics Cards (using dummy data for now) */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Your CropGuard Statistics</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Ionicons name="camera" size={28} color={Green} />
                            <Text style={styles.statNumber}>{userStats.plantsScanned}</Text>
                            <Text style={styles.statLabel}>Plants Scanned</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="bug" size={28} color="#E53E3E" />
                            <Text style={styles.statNumber}>{userStats.diseasesDetected}</Text>
                            <Text style={styles.statLabel}>Diseases Found</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={28} color={Yellow} />
                            <Text style={styles.statNumber}>{userStats.accuracy}</Text>
                            <Text style={styles.statLabel}>Accuracy Rate</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="leaf" size={28} color={Green} />
                            <Text style={styles.statNumber}>{userStats.healthyScans}</Text>
                            <Text style={styles.statLabel}>Healthy Plants</Text>
                        </View>
                    </View>
                </View>

                {/* Account Information (Using fetched data) */}
                <View style={styles.accountSection}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    
                    {/* Full Name */}
                    <View style={styles.infoCard}>
                        <Ionicons name="person-outline" size={24} color={Green} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoValue}>{getDisplayName() || 'Not set'}</Text>
                        </View>
                        <TouchableOpacity onPress={handleEditProfile}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Email */}
                    <View style={styles.infoCard}>
                        <Ionicons name="mail-outline" size={24} color={Green} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>{session.user.email}</Text>
                        </View>
                        {/* No edit icon for email as it requires a separate flow */}
                        <View style={{ width: 20 }} /> 
                    </View>

                    {/* Website (if applicable) */}
                    {profile?.website && (
                        <View style={styles.infoCard}>
                            <Ionicons name="globe-outline" size={24} color={Green} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Website</Text>
                                <Text style={styles.infoValue}>{profile.website}</Text>
                            </View>
                             <TouchableOpacity onPress={handleEditProfile}>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={Green} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Account Security</Text>
                            <Text style={styles.infoValue}>Password & Privacy</Text>
                        </View>
                        <TouchableOpacity onPress={handleSettings}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>

                    <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                        <Ionicons name="create-outline" size={20} color={Green} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
                        <Ionicons name="settings-outline" size={20} color={DarkGreen} />
                        <Text style={styles.settingsButtonText}>Settings & Privacy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer spacing */}
                <View style={styles.footer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: OffWhite,
    },
    
    // Profile Header Styles
    profileHeader: {
        backgroundColor: Green,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    profileIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    userName: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        color: "#fff",
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 8,
    },
    joinDate: {
        color: "#fff",
        fontSize: 14,
        opacity: 0.8,
    },

    // Statistics Section
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: DarkGreen,
        marginBottom: 16,
        textAlign: "center",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: DarkGreen,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        fontWeight: "500",
    },

    // Account Information Section
    accountSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    infoContent: {
        flex: 1,
        marginLeft: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: DarkGreen,
        fontWeight: "600",
    },

    // Action Buttons Section
    actionSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: Green,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    editButtonText: {
        color: Green,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    settingsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "#E0E0E0",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    settingsButtonText: {
        color: DarkGreen,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E53E3E",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    footer: {
        height: 100,
    },
});
