import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Responsive sizing
const { width } = Dimensions.get("window");

const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const LightGreen = "#E6F9EF";

// Example: user data from props or context (replace with your auth/user context)
const user = {
  name: "John Doe",
  email: "john.doe@cropguard.com",
  joinDate: "January 2024",
  plantsScanned: 47,
  diseasesDetected: 12,
  accuracy: "94%"
};

export default function Account() {
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of CropGuard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            console.log("User signed out");
            // TODO: Implement sign-out logic
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
    // TODO: Navigate to edit profile screen
  };

  const handleSettings = () => {
    console.log("Open settings");
    // TODO: Navigate to settings screen
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require("../assets/fonts/images/CropGuardLogo.png")} 
              style={styles.profileImage}
              resizeMode="contain"
            />
            <View style={styles.avatarOverlay}>
              <Ionicons name="person" size={40} color={Green} />
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your CropGuard Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="camera" size={28} color={Green} />
              <Text style={styles.statNumber}>{user.plantsScanned}</Text>
              <Text style={styles.statLabel}>Plants Scanned</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bug" size={28} color="#E53E3E" />
              <Text style={styles.statNumber}>{user.diseasesDetected}</Text>
              <Text style={styles.statLabel}>Diseases Found</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color={Yellow} />
              <Text style={styles.statNumber}>{user.accuracy}</Text>
              <Text style={styles.statLabel}>Accuracy Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={28} color={Green} />
              <Text style={styles.statNumber}>{user.plantsScanned - user.diseasesDetected}</Text>
              <Text style={styles.statLabel}>Healthy Plants</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={24} color={Green} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={24} color={Green} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

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
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
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