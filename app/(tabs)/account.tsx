import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from '../../lib/supabase';

import { eventEmitter, EVENTS } from '../../lib/eventEmitter';
import { logger } from '../../lib/logger';
import { profileCache } from '../../lib/profileCache';
import { SessionContext } from './_layout';
import { Modal } from 'react-native';

const { width } = Dimensions.get("window");

const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const LightGreen = "#E6F9EF";

interface Profile {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    website: string | null;
    avatar_url: string | null;
    tier: string | null;
}

interface UserStats {
    plantsScanned: number;
    diseasesDetected: number;
    healthyScans: number;
    accuracy: string;
}

export default function Account() {
    const router = useRouter();
    const { session, isLoading: isSessionLoading } = useContext(SessionContext);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [userStats, setUserStats] = useState<UserStats>({ 
        plantsScanned: 0, 
        diseasesDetected: 0, 
        healthyScans: 0,
        accuracy: '0%' 
    });
    
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

    const getTierInfo = () => {
        const tier = profile?.tier?.toLowerCase() || 'free';
        
        if (tier === 'premium') {
            return {
                label: 'Premium',
                color: '#FFD700',
                bgColor: '#6142ebff', // light gold background(OG): #FFF9E6
                icon: 'star' as const,
            };
        }
        
        return {
            label: 'Free',
            color: '#666',
            bgColor: '#F0F0F0',
            icon: 'leaf' as const,
        };
    };

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    async function fetchUserStats(forceRefresh = false) {
        if (!session?.user) return;

        if (!forceRefresh) {
            const cachedStats = profileCache.getStats(session.user.id);
            if (cachedStats) {
                setUserStats(cachedStats);
                return;
            }
        }

        try {
            const { count: totalCount, error: totalError } = await supabase
                .from('scan_activity')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
                
            if (totalError) throw totalError;

            const { count: healthyCount, error: healthyError } = await supabase
                .from('scan_activity')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .ilike('disease_id', '%healthy');

            if (healthyError) throw healthyError;

            const { data: accuracyData, error: accuracyError } = await supabase
                .from('scan_activity')
                .select('accuracy_score')
                .eq('user_id', session.user.id);

            if (accuracyError) throw accuracyError;
            
            const avgAccuracy = accuracyData?.length 
                ? (accuracyData.reduce((sum, item) => sum + (item.accuracy_score || 0), 0) / accuracyData.length)
                : 0;
            
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
            profileCache.setStats(session.user.id, stats);
            
        } catch (error) {
            if (error instanceof Error) {
                logger.error('Error fetching user stats:', error.message);
            }
        }
    }

    async function getProfile(forceRefresh = false) {
        if (!session?.user) {
            setLoadingProfile(false);
            return;
        }

        if (!forceRefresh) {
            const cachedProfile = profileCache.getProfile(session.user.id);
            if (cachedProfile) {
                setProfile(cachedProfile as Profile);
                setLoadingProfile(false);
                return;
            }
        }

        try {
            setLoadingProfile(true); 

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`first_name, last_name, username, website, avatar_url, tier`) 
                .eq('id', session.user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                const profileData = data as Profile;
                setProfile(profileData);
                profileCache.setProfile(session.user.id, profileData);
            } else {
                setProfile(null);
            }
        } catch (error) {
            if (error instanceof Error) {
                logger.error('Error fetching profile:', error.message);
            }
        } finally {
            setLoadingProfile(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (session?.user) {
                logger.log('Account screen focused, refreshing data...');
                getProfile(true);
                fetchUserStats(true);
            }
        }, [session])
    );

    useEffect(() => {
        logger.log("Account Component: Session Status (via Context) ->", session ? 'Active' : 'Null/Expired');
        
        if (session) {
            getProfile();
            fetchUserStats();
        } else {
            setProfile(null);
            setLoadingProfile(false);
            setUserStats({ plantsScanned: 0, healthyScans: 0, diseasesDetected: 0, accuracy: '0%' });
        }
    }, [session]);

    useEffect(() => {
        const handleScanCompleted = () => {
            logger.log('Account: Scan completed event received, refreshing stats...');
            if (session?.user) {
                profileCache.invalidateStats(session.user.id);
                fetchUserStats(true);
            }
        };

        eventEmitter.on(EVENTS.SCAN_COMPLETED, handleScanCompleted);

        return () => {
            eventEmitter.off(EVENTS.SCAN_COMPLETED, handleScanCompleted);
        };
    }, [session]);

    useEffect(() => {
        const handleProfileUpdated = () => {
            logger.log('Account: Profile updated event received, refreshing profile...');
            if (session?.user) {
                profileCache.invalidateProfile(session.user.id);
                getProfile(true);
            }
        };

        eventEmitter.on(EVENTS.PROFILE_UPDATED, handleProfileUpdated);

        return () => {
            eventEmitter.off(EVENTS.PROFILE_UPDATED, handleProfileUpdated);
        };
    }, [session]);

    const onRefresh = async () => {
        if (!session?.user) return;
        
        setRefreshing(true);
        logger.custom('🔄', 'Refreshing profile and stats...');
        
        try {
            await Promise.all([
                getProfile(true),
                fetchUserStats(true)
            ]);
        } catch (error) {
            logger.error('Error refreshing data:', error);
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
                            logger.log("User successfully signed out");
                            
                            if (session?.user) {
                                profileCache.invalidateUser(session.user.id);
                            }

                        } catch (error) {
                            logger.error("Logout Error:", error);
                            Alert.alert("Logout Error", "Failed to sign out. Please try again.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleEditProfile = () => {
        router.push("/editProfile");
    };

    const handleSettings = () => {
        Alert.alert("Feature", "Navigating to Settings...");
    };
    
    if (isSessionLoading || loadingProfile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: DarkGreen, fontSize: 18 }}>Loading Profile...</Text>
            </View>
        );
    }
    
    if (!session) {
        return (
             <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
                <Text style={{ color: DarkGreen, fontSize: 18, textAlign: 'center' }}>
                    Loading authentication...
                </Text>
            </View>
        );
    }

    const tierInfo = getTierInfo();

    return (
        <View style={styles.container}>
            <Modal
            transparent
            animationType="fade"
            visible={showUpgradeModal}
            onRequestClose={() => setShowUpgradeModal(false)}
            >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                    {profile?.tier === 'premium' ? 'Revert to Free?' : 'Upgrade to Premium?'}
                </Text>
                <Text style={styles.modalText}>
                    {profile?.tier === 'premium'
                        ? 'You will lose access to premium features.'
                        : 'Unlock plant experts and exclusive plant health insights.'}
                </Text>

                <View style={styles.modalButtons}>
                    <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowUpgradeModal(false)}
                    >
                    <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={async () => {
                        if (!session?.user) return;

                        const newTier = profile?.tier === 'premium' ? 'free' : 'premium';
                        const actionText = newTier === 'premium' ? 'upgraded' : 'reverted';

                        const { error } = await supabase
                            .from("profiles")
                            .update({ tier: newTier })
                            .eq("id", session.user.id);

                        if (error) {
                            Alert.alert("Error", "Failed to update account tier. Try again.");
                            console.error(error);
                        } else {
                        Alert.alert("Success", "You're account has been " + actionText + ".");
                        // Update local state immediately (no wait)
                        setProfile((prev) => prev ? { ...prev, tier: newTier } : prev);                       
                        profileCache.invalidateProfile(session.user.id);
                        await getProfile(true); // refresh
                        setShowUpgradeModal(false);
                        }
                    }}
                    >
                    <Text style={styles.confirmText}>
                        {profile?.tier === 'premium' ? 'Revert' : 'Upgrade'}
                    </Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
            </Modal>



            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Green]}
                        tintColor={Green}
                        title="Pull to refresh"
                        titleColor={DarkGreen}
                    />
                }
            >
                <View style={styles.profileHeader}>
                    <View style={styles.profileIconContainer}>
                        <Ionicons name="person" size={40} color={Green} />
                    </View>
                    
                    <View style={styles.nameContainer}>
                        <View style={[styles.tierBadge, { backgroundColor: tierInfo.bgColor }]}>
                            <Ionicons name={tierInfo.icon} size={14} color={tierInfo.color} />
                            <Text style={[styles.tierText, { color: tierInfo.color }]}>
                                {tierInfo.label}
                            </Text>
                        </View>
                            <Text style={styles.userName}>{getDisplayName()}</Text>
                        </View>

                    <Text style={styles.userEmail}>{session.user.email}</Text>
                    <Text style={styles.joinDate}>Member since {joinDate}</Text>
                </View>

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

                <View style={styles.accountSection}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    
                    <View style={styles.infoCard}>
                        <Ionicons name="person-outline" size={24} color={Green} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Full Name</Text>
                            <Text style={styles.infoValue}>{getDisplayName() || 'Not set'}</Text>
                        </View>
                        <TouchableOpacity onPress={handleEditProfile}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="mail-outline" size={24} color={Green} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>{session.user.email}</Text>
                        </View>
                        <View style={{ width: 20 }} /> 
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name={tierInfo.icon} size={24} color={tierInfo.color} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Account Tier</Text>
                            <Text style={styles.infoValue}>{tierInfo.label}</Text>
                        </View>
                        {tierInfo.label === 'Free' ? (
                            <TouchableOpacity onPress={() => setShowUpgradeModal(true)}>
                                <View style={styles.upgradeButton}>
                                    <Text style={styles.upgradeText}>Upgrade</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setShowUpgradeModal(true)}>
                                <View style={styles.manageButton}>
                                    <Text style={styles.manageText}>Manage</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                    </View>

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
    nameContainer: {
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    userName: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    tierBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tierText: {
        fontSize: 12,
        fontWeight: "bold",
        //textShadowColor: '#FFFFFF', 
        //textShadowRadius: 2, 
        //textShadowOffset: { width: 0, height: 0 }, 
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
    upgradeButton: {
        backgroundColor: Green,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    upgradeText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "bold",
    },
    manageButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: Green,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    manageText: {
        color: Green,
        fontSize: 13,
        fontWeight: "bold",
    },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: DarkGreen,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: "#E0E0E0",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    confirmButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: Green,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelText: {
        color: DarkGreen,
        fontWeight: "600",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
    },

});