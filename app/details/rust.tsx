import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";

export default function Rust() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rust</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/fonts/images/rust.jpg")}
            style={styles.image}
          />
        </View>

        {/* Info Container */}
        <View style={styles.infoContainer}>
          {/* What is Rust */}
          <Text style={styles.sectionTitle}>What is Rust?</Text>
          <Text style={styles.sectionText}>
            Leaf Rust is a fungal disease caused by pathogens in the Puccinia genus. It appears as reddish-brown or orange powdery spots, usually on the underside of leaves, and thrives in warm, humid conditions. The disease disrupts photosynthesis, weakens plants, and can lead to leaf drop and reduced growth.
          </Text>
          <View style={styles.divider} />

          {/* Causes */}
          <Text style={styles.sectionTitle}>Causes</Text>
          <Text style={styles.sectionSubtitle}>Fungus Spores:</Text>
          <Text style={styles.sectionText}>• Caused by Puccinia fungus, which spreads through tiny airborne spores.</Text>
          <Text style={styles.sectionSubtitle}>Warm, Humid Weather:</Text>
          <Text style={styles.sectionText}>• Thrives in wet, warm conditions, especially after rain or heavy watering.</Text>
          <Text style={styles.sectionSubtitle}>Crowded Plants:</Text>
          <Text style={styles.sectionText}>• Plants too close together trap moisture, making it easier for rust to spread.</Text>
          <Text style={styles.sectionSubtitle}>Splashing Water:</Text>
          <Text style={styles.sectionText}>• Water splashing from infected leaves to healthy leaves spreads the fungus.</Text>
          <View style={styles.divider} />

          {/* Prevention Tips */}
          <Text style={styles.sectionTitle}>Prevention Tips</Text>
          <Text style={styles.sectionSubtitle}>Ensure Proper Spacing:</Text>
          <Text style={styles.sectionText}>• Keep enough space between plants so air can flow and leaves dry faster.</Text>
          <Text style={styles.sectionSubtitle}>Water at the Base:</Text>
          <Text style={styles.sectionText}>• Avoid watering leaves. Water the soil near the roots instead.</Text>
          <Text style={styles.sectionSubtitle}>Regular Monitoring:</Text>
          <Text style={styles.sectionText}>• Check plants often for early spots so you can stop the disease quickly.</Text>
          <View style={styles.divider} />

          {/* Treatment Methods */}
          <Text style={styles.sectionTitle}>Treatment Methods</Text>
          <Text style={styles.sectionSubtitle}>Apply Fungicides:</Text>
          <Text style={styles.sectionText}>• Spray fungicides with copper or sulfur when you see the first signs.</Text>
          <Text style={styles.sectionSubtitle}>Use Natural Sprays:</Text>
          <Text style={styles.sectionText}>• Neem oil or baking soda spray can help control rust naturally.</Text>
          <Text style={styles.sectionSubtitle}>Remove Affected Leaves:</Text>
          <Text style={styles.sectionText}>• Cut off and throw away sick leaves. Do not put them in compost.</Text>
          <Text style={styles.sectionSubtitle}>Improve Air and Drainage:</Text>
          <Text style={styles.sectionText}>• Make sure plants get air and water drains well so leaves don’t stay wet.</Text>
          <View style={styles.divider} />

          {/* Did You Know */}
          <View style={styles.didYouKnowContainer}>
            <Text style={styles.didYouKnowTitle}>{"💡 Did You Know?"}</Text>
            <Text style={styles.didYouKnowText}>
              Leaf Rust spores can travel long distances in the wind and infect plants miles away.
            </Text>
          </View>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Green,
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  backArrow: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 38, // to center title with back arrow
  },
  scrollContent: {
    padding: 0,
    backgroundColor: OffWhite,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: "100%",
    alignItems: "center",
    paddingBottom: 0,
  },
  imageContainer: {
    width: "100%",
    backgroundColor: OffWhite,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 10,
  },
  image: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    backgroundColor: OffWhite,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    marginTop: 18,
    
    paddingBottom:100,
    elevation: 2,
  },
  sectionTitle: {
    color: Green,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 10,
  },
  sectionSubtitle: {
    color: Green,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 2,
  },
  sectionText: {
    color: DarkGreen,
    fontSize: 15,
    marginLeft: 8,
    marginBottom: 2,
  },
  divider: {
    borderBottomColor: OffWhite,
    borderBottomWidth: 2,
    marginVertical: 14,
  },
  didYouKnowContainer: {
    marginTop: 10,
    backgroundColor: OffWhite,
    borderRadius: 10,
    padding: 10,
    alignItems: "flex-start",
  },
  didYouKnowTitle: {
    color: Green,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  didYouKnowText: {
    color: DarkGreen,
    fontSize: 14,
    fontStyle: "italic",
  },
});
