import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = '#021A1A';

export default function Account() {
  // Placeholder user data
  const user = {
    name: "Leonardo De Morgan",
    email: "Leonardodemorgan@gmail.com",
    password: "Leonard1986",
  };

  const handleLogout = () => {
    // TODO: Add sign-out logic here
    console.log("User logged out");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Profile Icon */}
      <View style={styles.profileIcon}>
        <Ionicons name="person-circle-outline" size={150} color={DarkGreen} />
      </View>

      {/* Info Section */}
      <View style={styles.infoBox}>
        <Ionicons name="person-outline" size={20} color="black" />
        <Text style={styles.infoText}>Name: {user.name}</Text>
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="mail-outline" size={20} color="black" />
        <Text style={styles.infoText}>Email: {user.email}</Text>
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="eye-outline" size={20} color="black" />
        <Text style={styles.infoText}>Password: {user.password}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 60,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileIcon: {
    alignItems: "center",
    marginVertical: 20,
    
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  logoutButton: {
    backgroundColor: Green,
    borderRadius: 30,
    marginHorizontal: 50,
    marginTop: 100,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
