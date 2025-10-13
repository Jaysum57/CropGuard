import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, DiseaseData, getAllDiseases, getDiseasesByCategory, searchDiseases } from "../../components/DiseaseData";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.42; // Reduced from 0.45 to allow for spacing
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const Yellow = "#FFD94D";

export default function AllDiseases() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [diseases, setDiseases] = useState<DiseaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredDiseases, setFilteredDiseases] = useState<DiseaseData[]>([]);

  useEffect(() => {
    loadDiseases();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      performSearch();
    } else {
      filterByCategory();
    }
  }, [search, selectedCategory, diseases]);

  const loadDiseases = async () => {
    try {
      setLoading(true);
      const data = await getAllDiseases();
      setDiseases(data);
    } catch (error) {
      console.error("Error loading diseases:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const results = await searchDiseases(search);
      const filtered = selectedCategory === "All" 
        ? results 
        : results.filter(item => item.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      setFilteredDiseases(filtered);
    } catch (error) {
      console.error("Error searching diseases:", error);
    }
  };

  const filterByCategory = async () => {
    try {
      const filtered = await getDiseasesByCategory(selectedCategory);
      setFilteredDiseases(filtered);
    } catch (error) {
      console.error("Error filtering diseases:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#FF4444';
      case 'Medium': return Yellow;
      case 'Low': return Green;
      default: return Green;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fungal': return 'leaf-outline';
      case 'Bacterial': return 'medical-outline';
      case 'Viral': return 'bug-outline';
      case 'Pest': return 'bug';
      default: return 'leaf-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Disease Library</Text>
            <Text style={styles.headerSubtitle}>Loading...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Green} />
          <Text style={styles.loadingText}>Loading disease database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Disease Library</Text>
          <Text style={styles.headerSubtitle}>{filteredDiseases.length} diseases found</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search diseases, symptoms..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons 
                name={getCategoryIcon(category) as any} 
                size={16} 
                color={selectedCategory === category ? "#fff" : Green} 
                style={styles.categoryIcon}
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.statCard}>
            <Ionicons name="library-outline" size={24} color={Green} />
            <Text style={styles.statNumber}>{diseases.length}</Text>
            <Text style={styles.statLabel}>Total Diseases</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="warning" size={24} color="#FF4444" />
            <Text style={styles.statNumber}>{diseases.filter(d => d.severity === 'High').length}</Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
        </View>

        {/* Disease Grid */}
        <FlatList
          data={filteredDiseases}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.diseaseCard}
              onPress={() => router.push(`/details/${item.id}` as any)}
            >
              <View style={styles.imageSection}>
                <View style={styles.imageContainer}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.diseaseImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons 
                        name={getCategoryIcon(item.category) as any} 
                        size={40} 
                        color="#ccc" 
                      />
                    </View>
                  )}
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.topContent}>
                  <Text style={styles.diseaseTitle}>{item.name}</Text>
                  <Text style={styles.diseaseCategory}>{item.category}</Text>
                  <Text style={styles.diseaseDescription} numberOfLines={4}>
                    {item.description}
                  </Text>
                </View>
                
                <View style={styles.cropsContainer}>
                  <Ionicons name="leaf-outline" size={12} color="#666" />
                  <Text style={styles.cropsText} numberOfLines={3}>
                    {item.affectedCrops.join(", ")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {filteredDiseases.length === 0 && !loading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.noResultsTitle}>No Results Found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your search terms or category filter
            </Text>
          </View>
        )}
      </ScrollView>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: DarkGreen,
  },
  clearButton: {
    padding: 5,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Green,
  },
  activeCategoryButton: {
    backgroundColor: Green,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Green,
  },
  activeCategoryText: {
    color: '#fff',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DarkGreen,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  row: {
    justifyContent: 'space-around', // Changed from 'space-between' to 'space-around' for better spacing
    paddingHorizontal: 5, // Add horizontal padding for consistent edge spacing
  },
  diseaseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    width: CARD_WIDTH,
    minHeight: 280, // Changed from fixed height to minHeight to allow flexibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageSection: {
    height: 120,
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  diseaseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    padding: 14, // Increased from 12 to give more breathing room
    flex: 1, // Allow content to expand
    justifyContent: 'space-between', // Distribute space to push crops to bottom
  },
  topContent: {
    flexShrink: 1, // Allow this section to shrink if needed
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
    marginBottom: 4,
  },
  diseaseCategory: {
    fontSize: 12,
    color: Green,
    fontWeight: '600',
    marginBottom: 6,
  },
  diseaseDescription: {
    fontSize: 13, // Increased from 12 for better readability
    color: '#666',
    lineHeight: 18, // Increased from 16 for better spacing
    marginBottom: 8,
    maxHeight: 90, // Changed from minHeight to maxHeight to prevent overflow
  },
  cropsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8, // Add some space above the crops section
    paddingTop: 8, // Add padding to separate from description
    borderTopWidth: 1, // Add a subtle border to visually separate
    borderTopColor: '#f0f0f0',
  },
  cropsText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: DarkGreen,
    marginTop: 16,
    textAlign: 'center',
  },
});