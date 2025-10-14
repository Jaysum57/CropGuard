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
import { categories } from "../../components/DiseaseData";
import { supabase } from "../../lib/supabase";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.45;
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const Yellow = "#FFD94D";

interface Disease {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  affectedCrops: string[];
  image_url: string; // Updated to match database
  page?: string;
}

const AllDiseases = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);

  // ADDED: Fetch data when the component mounts
  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('disease_data')
        .select('*');

      if (error) {
        console.error('Error fetching diseases:', error);
        return;
      }

      // 🛑 FIX APPLIED HERE:
      // The Supabase client returns affected_crops as a JavaScript array (string[]),
      // so we should stop trying to parse it as a string.
      const formattedDiseases = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        severity: d.severity,
        // Direct assignment: Use the fetched array or an empty array as fallback
        affectedCrops: (d.affected_crops || []) as string[], 
        image_url: d.image_url,
        page: d.page,
      })) as Disease[];

      setDiseases(formattedDiseases);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort diseases based on search and category in alphabetical order
  const filteredDiseases = diseases.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Green} />
            <Text style={styles.loadingText}>Loading diseases...</Text>
          </View>
        ) : (
          <>
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
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{diseases.length}</Text>
                <Text style={styles.statLabel}>Total Diseases</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{diseases.filter(d => d.severity === 'High').length}</Text>
                <Text style={styles.statLabel}>High Severity</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{categories.length - 1}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>

            {/* Disease Grid */}
            <View style={styles.gridContainer}>
              <FlatList
                data={filteredDiseases}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.diseaseCard}
                    onPress={() => router.push(item.page || `/details/${item.id}` as any)}
                    activeOpacity={0.7}
                  >
                    {/* Disease Image */}
                    <View style={styles.imageContainer}>
                      {item.image_url ? ( 
                        <Image 
                          source={{ uri: item.image_url }} 
                          style={styles.diseaseImage} 
                        />
                      ) : (
                        <View style={styles.placeholderContainer}>
                          <Ionicons 
                            name={getCategoryIcon(item.category) as any} 
                            size={40} 
                            color={Green} 
                          />
                        </View>
                      )}
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                        <Text style={styles.severityText}>{item.severity}</Text>
                      </View>
                    </View>

                    {/* Disease Info */}
                    <View style={styles.diseaseInfo}>
                      <Text style={styles.diseaseTitle}>{item.name}</Text>
                      <Text style={styles.diseaseCategory}>{item.category}</Text>
                      <Text style={styles.diseaseDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      
                      {/* Affected Crops */}
                      <View style={styles.plantsContainer}>
                        <Text style={styles.plantsLabel}>Affected Crops:</Text>
                        <Text style={styles.plantsText} numberOfLines={1}>
                          {item.affectedCrops.join(", ")}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* No Results */}
            {filteredDiseases.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={60} color="#ccc" />
                <Text style={styles.noResultsTitle}>No diseases found</Text>
                <Text style={styles.noResultsText}>
                  Try adjusting your search or filter criteria
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: DarkGreen,
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryContent: {
    paddingLeft: 4,
    paddingRight: 30,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: Green,
    borderColor: Green,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Green,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 28,
    paddingBottom: 100,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  diseaseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: (screenWidth - 72) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  diseaseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: OffWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  diseaseInfo: {
    padding: 16,
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
    marginBottom: 8,
  },
  diseaseDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  plantsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  plantsLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    marginBottom: 2,
  },
  plantsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
});

export default AllDiseases;