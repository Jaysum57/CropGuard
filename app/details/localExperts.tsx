import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const Green = "#30BE63";
const DarkGreen = "#021A1A";
const OffWhite = "#F6F6F6";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  availability: "Available" | "Busy" | "Unavailable";
  rating: number;
  consultation_fee: string;
  description: string;
}

const SPECIALTIES = [
  "All Specialties",
  "Plant Diseases",
  "Pest Management",
  "Soil Health",
  "Crop Nutrition",
  "Organic Farming",
  "Agricultural Extension",
];

export default function LocalExpertsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    filterExperts();
  }, [searchQuery, selectedSpecialty, experts]);

  const fetchExperts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("local_experts")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;

      setExperts(data || []);
    } catch (error) {
      console.error("Error fetching experts:", error);
      Alert.alert("Error", "Failed to load experts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterExperts = () => {
    let filtered = experts;

    // Filter by specialty
    if (selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter((expert) =>
        expert.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expert) =>
          expert.name.toLowerCase().includes(query) ||
          expert.specialty.toLowerCase().includes(query) ||
          expert.location.toLowerCase().includes(query)
      );
    }

    setFilteredExperts(filtered);
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Unable to make phone calls on this device");
        }
      })
      .catch((err) => console.error("Error opening phone:", err));
  };

  const handleEmail = (email: string) => {
    const emailUrl = `mailto:${email}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert("Error", "Unable to open email client");
        }
      })
      .catch((err) => console.error("Error opening email:", err));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return Green;
      case "Busy":
        return "#FF8C00";
      case "Unavailable":
        return "#E53E3E";
      default:
        return "#999";
    }
  };

  const renderExpertCard = ({ item }: { item: Expert }) => (
    <View style={styles.expertCard}>
      {/* Expert Header */}
      <View style={styles.expertHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color={Green} />
        </View>
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <View
          style={[
            styles.availabilityBadge,
            { backgroundColor: getAvailabilityColor(item.availability) + "20" },
          ]}
        >
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: getAvailabilityColor(item.availability) },
            ]}
          />
          <Text
            style={[
              styles.availabilityText,
              { color: getAvailabilityColor(item.availability) },
            ]}
          >
            {item.availability}
          </Text>
        </View>
      </View>

      {/* Rating & Fee */}
      <View style={styles.metaRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.feeContainer}>
          <Ionicons name="cash-outline" size={16} color={Green} />
          <Text style={styles.fee}>{item.consultation_fee}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => handleEmail(item.email)}
        >
          <Ionicons name="mail" size={18} color={Green} />
          <Text style={styles.emailButtonText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Experts Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your filters or search query
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Green} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Local Experts</Text>
          <Text style={styles.headerSubtitle}>
            {filteredExperts.length} expert{filteredExperts.length !== 1 ? "s" : ""} available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchExperts}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, specialty, or location"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Specialty Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {SPECIALTIES.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.filterChip,
                selectedSpecialty === specialty && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSpecialty === specialty && styles.filterChipTextActive,
                ]}
              >
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Experts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Green} />
          <Text style={styles.loadingText}>Loading experts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExperts}
          renderItem={renderExpertCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
  },
  header: {
    backgroundColor: Green,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  refreshButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: OffWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: DarkGreen,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: OffWhite,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: Green,
    borderColor: Green,
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  expertCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  expertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: OffWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: Green,
    fontWeight: "600",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: "#666",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 15,
    fontWeight: "600",
    color: DarkGreen,
  },
  feeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fee: {
    fontSize: 14,
    fontWeight: "600",
    color: Green,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Green,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  callButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  emailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Green,
    gap: 6,
  },
  emailButtonText: {
    color: Green,
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});