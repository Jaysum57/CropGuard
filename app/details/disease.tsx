import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.45;
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#0E312F";

const diseases = [
  {
    title: "Rust",
    description: "Fungal disease causing orange-brown pustules on leaves.",
    image: require("../../assets/fonts/images/rust.jpg"),
    page: "/details/rust",
  },
  {
    title: "Powdery Mildew",
    description: "White powdery fungus that affects leaf surfaces.",
    page: "/details/powdery",
  },
  {
    title: "Leaf Spot",
    description: "Circular dark spots caused by fungal or bacterial infection.",
    page: "/details/leafspot",
  },
  {
    title: "Leaf pore",
    description: "Circular dark spots caused by fungal or bacterial infection.",
    page: "/details/leafspot",
  },
];

export default function AllDiseases() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredDiseases = diseases.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Diseases</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          flex: 1, 
          paddingBottom: 20,
          backgroundColor: "#fff",
        }}
      >
        <TextInput
          placeholder="Search diseases..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />
        <FlatList
          data={filteredDiseases}
          horizontal={false}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.cardsContainer}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: CARD_WIDTH }]}
              onPress={() => router.push(item.page)}
              activeOpacity={0.85}
            >
              <View style={styles.imageWrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginRight: 38,
  },
  searchBar: {
    backgroundColor: OffWhite,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    fontSize: 16,
  },
  cardsContainer: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 0,
    margin: 8,
    elevation: 4,
    flexDirection: "column",
    minHeight: 250,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrapper: {
    width: "100%",
    height: 110,
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
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "left",
    alignSelf: "stretch",
    paddingHorizontal: 10,
  },
  cardDescription: {
    color: DarkGreen,
    fontSize: 13,
    marginBottom: 10,
    textAlign: "left",
    paddingHorizontal: 10,
    alignSelf: "stretch",
  },
});