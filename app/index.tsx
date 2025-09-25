import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.55;
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#0E312F";

const diseases = [
  {
    title: "Rust",
    description: "Fungal disease causing orange-brown pustules on leaves.",
    image: require("../assets/fonts/images/rust.jpg"),
    page: "/details/rust",
    tag: "Fungal",
    tip: "Remove infected leaves early!",
  },
  {
    title: "Powdery Mildew",
    description: "White powdery fungus that affects leaf surfaces.",
    // image: require("../assets/fonts/images/powdery.jpg"),
    page: "/details/powdery",
    tag: "Fungal",
    tip: "Increase air circulation to prevent mildew.",
  },
  {
    title: "Leaf Spot",
    description: "Circular dark spots caused by fungal or bacterial infection.",
    // image: require("../assets/fonts/images/leafspot.jpg"),
    page: "/details/leafspot",
    tag: "Bacterial",
    tip: "Avoid overhead watering to reduce spread.",
  },
];

const user = {
  name: "Leonardo", 
  
};

export default function Index() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Filter diseases based on search or show all
  const filteredDiseases = showAll
    ? diseases
    : diseases.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userText}>{user.name}</Text>
        </View>

        {/* Logo / Illustration */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/fonts/images/CropGuardLogo.png")}
            style={styles.logo}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: Green }]}
            onPress={() => router.push("/scan")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="camera"
                size={26}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.quickButtonText}>Scan Leaf</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: DarkGreen }]}
            onPress={() => router.push("/details/disease")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="albums"
                size={26}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.quickButtonText}>All Diseases</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Diseases Section */}
        <Text style={styles.diseasesText}>Common Diseases</Text>
        <FlatList
          data={filteredDiseases}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[
            styles.cardsContainer,
            { overflow: "visible", paddingBottom: 30 },
          ]}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { width: CARD_WIDTH, overflow: "visible", marginBottom: 16 },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push(item.page)}
            >
              <View style={styles.cardImageWrapper}>
                {item.image ? (
                  <Image source={item.image} style={styles.cardImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    marginTop: 5,
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: DarkGreen,
  },
  userText: {
    fontSize: 34,
    fontWeight: "bold",
    color: Green,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingHorizontal: 20,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  quickButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: OffWhite,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
  },
  diseasesText: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 10,
    marginTop: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 0,
    marginHorizontal: 10,
    elevation: 4,
    height: 250,
    flexDirection: "column",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImageWrapper: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    backgroundColor: OffWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: OffWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: DarkGreen,
    fontSize: 14,
    fontStyle: "italic",
  },
  cardTitle: {
    color: Green,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "left",
    alignSelf: "stretch",
    paddingHorizontal: 15,
  },
  cardDescription: {
    color: DarkGreen,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "left",
    paddingHorizontal: 15,
    alignSelf: "stretch",
  },
});