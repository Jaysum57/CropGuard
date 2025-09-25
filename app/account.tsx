import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Responsive sizing
const { width } = Dimensions.get("window");
const CARD_WIDTH = width > 500 ? 450 : width * 0.95;

const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const LightGreen = "#E6F9EF";

// Example: user data from props or context (replace with your auth/user context)
const user = {
  name: "Your User Name",
  email: "your@email.com",
  password: "hidden", // Don't show or store plain passwords!
};

export default function Account() {
  // Example sign-out logic (replace with your auth logic)
  const handleLogout = () => {
    // Example: Show confirmation and clear user session/token
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // TODO: Replace this with your sign-out logic (e.g., clear token, navigate to login)
            console.log("User logged out");
            // Example: navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={90} color="#fff" />
        <Text style={styles.headerText}>{user.name}</Text>
        <Text style={styles.headerSubText}>{user.email}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Cards */}
        <View style={[styles.infoCard, { width: CARD_WIDTH }]}>
          <Ionicons name="person-outline" size={22} color={Green} style={styles.infoIcon} />
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>
        <View style={[styles.infoCard, { width: CARD_WIDTH }]}>
          <Ionicons name="mail-outline" size={22} color={Green} style={styles.infoIcon} />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={[styles.infoCard, { width: CARD_WIDTH }]}>
          <Ionicons name="lock-closed-outline" size={22} color={Green} style={styles.infoIcon} />
          <Text style={styles.label}>Password</Text>
          <Text style={styles.value}>**********</Text>
        </View>
        

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
  },
  header: {
    backgroundColor: Green,
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSubText: {
    color: "#fff",
    fontSize: 15,
    opacity: 0.85,
    marginTop: 2,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 7,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  infoIcon: {
    marginRight: 14,
  },
  label: {
    color: DarkGreen,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 8,
    opacity: 0.7,
    width: 70,
  },
  value: {
    color: DarkGreen,
    fontSize: 17,
    fontWeight: "bold",
    flex: 1,
    flexWrap: "wrap",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: Green,
    borderRadius: 30,
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 4,
  },
});