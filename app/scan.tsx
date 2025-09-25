import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";

export default function Scan() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/fonts/images/CropGuardScanLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <View style={styles.buttonContent}>
          <Ionicons name="camera" size={26} color="#fff" style={styles.iconLeft} />
          <Text style={styles.buttonText}>Start Camera</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <View style={styles.buttonContent}>
          <Ionicons name="image" size={26} color="#fff" style={styles.iconLeft} />
          <Text style={styles.buttonText}>Open Gallery</Text>
        </View>
      </TouchableOpacity>
      {/* Tip */}
      <View style={styles.tipContainer}>
        <Ionicons name="bulb-sharp" size={18} color={Green} style={styles.tipIcon} />
        <Text style={styles.tipText}>
          Tip: Ensure the image is clear and well-lit to improve detection
          accuracy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
    alignItems: "center",
    padding: 24,
    justifyContent: "flex-start",
  },
  logo: {
    width: 300,
    height: 300,
    marginTop: 150,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Green,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginVertical: 8,
    width: "90%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 12,
    marginTop: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
    paddingHorizontal: 10,
    width: "100%",
  },
  tipIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  tipText: {
    color: DarkGreen,
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
});