import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Scan() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.subtitle}>
        Start scanning your crops for diseases or pests.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#30BE63",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});