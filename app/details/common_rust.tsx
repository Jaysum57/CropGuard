
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const Yellow = "#FFD94D";
const Orange = "#FF8C00";
const Red = "#E53E3E";

export default function CommonRust() {
  const router = useRouter();

  const diseaseData = {
    name: "Common Rust",
    scientificName: "Puccinia sorghi",
    severity: "High",
    category: "Fungal Disease",
    description:
      "Common Rust is a fungal disease that affects corn leaves, forming reddish-brown pustules that weaken the plant, reduce photosynthesis, and lower yields.",
    affectedCrops: ["Corn (Maize)", "Sweet Corn"],
    quickStats: {
      severity: { level: "High", score: "8/10" },
      transmission: { level: "Fast", score: "8/10" },
      treatment: { level: "Medium", score: "6/10" },
      impact: { level: "Severe", score: "8/10" },
    },
  };

  const keySymptoms = [
    {
      title: "Reddish-Brown Pustules",
      description:
        "Small, round, rust-colored pustules appear on both upper and lower leaf surfaces.",
      severity: "critical",
      icon: "alert-circle",
    },
    {
      title: "Premature Leaf Drying",
      description:
        "Leaves turn yellow or brown early, reducing photosynthetic activity.",
      severity: "high",
      icon: "leaf",
    },
    {
      title: "Reduced Kernel Development",
      description:
        "Less photosynthesis leads to small, poorly filled corn kernels.",
      severity: "high",
      icon: "bar-chart",
    },
    {
      title: "Decreased Growth",
      description:
        "Infected plants show reduced vigor and may mature early with lower yield.",
      severity: "moderate",
      icon: "trending-down",
    },
  ];

  const preventionMethods = [
    {
      title: "Resistant Varieties",
      description:
        "Plant corn hybrids that are resistant or tolerant to Common Rust.",
      icon: "shield-checkmark-outline",
      difficulty: "Medium",
    },
    {
      title: "Crop Rotation",
      description:
        "Avoid planting corn in the same field year after year to reduce fungal spores.",
      icon: "refresh-outline",
      difficulty: "Medium",
    },
    {
      title: "Plant Timing",
      description:
        "Plant early so crops mature before rust pressure becomes high.",
      icon: "time-outline",
      difficulty: "Easy",
    },
    {
      title: "Field Sanitation",
      description:
        "Remove and destroy infected crop residues after harvest to limit spore survival.",
      icon: "trash-outline",
      difficulty: "Easy",
    },
    {
      title: "Adequate Spacing",
      description:
        "Maintain proper plant spacing for good airflow and faster leaf drying.",
      icon: "resize-outline",
      difficulty: "Easy",
    },
  ];

  const treatments = [
    {
      title: "Apply Fungicides",
      description:
        "Use fungicides containing azoxystrobin, pyraclostrobin, or propiconazole when rust first appears.",
      icon: "medical-outline",
      effectiveness: "High",
    },
    {
      title: "Monitor Regularly",
      description:
        "Inspect fields weekly for early signs of pustules, especially under humid conditions.",
      icon: "eye-outline",
      effectiveness: "Moderate",
    },
    {
      title: "Remove Infected Leaves",
      description:
        "If possible, remove heavily infected leaves to reduce spore spread.",
      icon: "cut-outline",
      effectiveness: "Low",
    },
    {
      title: "Improve Air Circulation",
      description:
        "Ensure proper plant spacing and field management to minimize humidity.",
      icon: "sunny-outline",
      effectiveness: "High",
    },
  ];


  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return Red;
      case 'high': return Orange;
      case 'moderate': return Yellow;
      default: return Green;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header with Gradient */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{diseaseData.name}</Text>
          <Text style={styles.headerSubtitle}>{diseaseData.scientificName}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: Red }]}>
          <Ionicons name="warning" size={16} color="#fff" />
          <Text style={styles.severityText}>{diseaseData.severity}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/common_rust.jpg")}
              style={styles.diseaseImage}
            />
            <View style={styles.imageOverlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.overlayTitle}>{diseaseData.category}</Text>
                <Text style={styles.overlayDescription}>
                  {diseaseData.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Dashboard */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Disease Overview</Text>
          <View style={styles.modernStatsGrid}>
            <View style={styles.modernStatCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="warning" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Risk Level</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats.severity.level}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats.severity.score}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Orange }]}>
                <Ionicons name="flash" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Spread Rate</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats.transmission.level}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats.transmission.score}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Green }]}>
                <Ionicons name="medical" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Treatment</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats.treatment.level}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats.treatment.score}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Red }]}>
                <Ionicons name="trending-down" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Impact</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats.impact.level}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats.impact.score}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Affected Crops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="leaf" size={20} color={Green} /> Commonly Affected Crops
          </Text>
          <View style={styles.cropsGrid}>
            {diseaseData.affectedCrops.map((crop, index) => (
              <View key={index} style={styles.cropChip}>
                <Ionicons name="leaf-outline" size={16} color={Green} />
                <Text style={styles.cropText}>{crop}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="warning" size={20} color={Red} /> Key Symptoms
          </Text>
          <View style={styles.symptomsGrid}>
            {keySymptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomCard}>
                <View style={styles.symptomHeader}>
                  <Ionicons 
                    name={symptom.icon as any} 
                    size={20} 
                    color={getSeverityColor(symptom.severity)} 
                  />
                  <Text style={styles.symptomTitle}>{symptom.title}</Text>
                  <View style={[styles.severityDot, { backgroundColor: getSeverityColor(symptom.severity) }]} />
                </View>
                <Text style={styles.symptomDescription}>{symptom.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Prevention Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="shield-checkmark" size={20} color={Green} /> Prevention Methods
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

          <View style={styles.methodsGrid}>
            {preventionMethods.map((method, index) => (
              <View key={index} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <Ionicons name={method.icon as any} size={20} color={Green} />
                  <View style={styles.methodTitleContainer}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <View style={[styles.difficultyBadge, { 
                      backgroundColor: method.difficulty === 'Easy' ? Green : 
                                     method.difficulty === 'Medium' ? Orange : Red 
                    }]}>
                      <Text style={styles.difficultyText}>{method.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Treatment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="medical" size={20} color={Orange} /> Treatment Options
          </Text>
          <View style={styles.treatmentsGrid}>
            {treatments.map((treatment, index) => (
              <View key={index} style={styles.treatmentCard}>
                <View style={styles.treatmentHeader}>
                  <Ionicons name={treatment.icon as any} size={20} color={Orange} />
                  <View style={styles.treatmentTitleContainer}>
                    <Text style={styles.treatmentTitle}>{treatment.title}</Text>
                    <View style={[styles.effectivenessBadge, { 
                      backgroundColor: treatment.effectiveness === 'High' ? Green : 
                                     treatment.effectiveness === 'Moderate' ? Orange : Red 
                    }]}>
                      <Text style={styles.effectivenessText}>{treatment.effectiveness}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.treatmentDescription}>{treatment.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expert Tip */}
        <View style={styles.section}>
          <View style={styles.expertTipCard}>
            <View style={styles.expertTipHeader}>
              <Ionicons name="bulb" size={24} color={Yellow} />
              <Text style={styles.expertTipTitle}>Expert Tip</Text>
            </View>
            <Text style={styles.expertTipText}>
              Early detection is crucial for rust management. Inspect the undersides of leaves weekly during humid conditions, 
              as rust pustules often appear there first. Combining cultural practices with targeted fungicide applications 
              provides the most effective control strategy.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
  },
  // New modern styles for redesigned layout
  overlayContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overlayDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  modernStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modernStatCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    minWidth: '45%',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statCategory: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  statMainValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DarkGreen,
    marginBottom: 1,
  },
  statScore: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropText: {
    fontSize: 14,
    color: DarkGreen,
    fontWeight: '500',
  },
  symptomsGrid: {
    gap: 12,
  },
  symptomCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
    flex: 1,
  },
  symptomDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  methodsGrid: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  methodTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  treatmentsGrid: {
    gap: 12,
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  treatmentTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  effectivenessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  effectivenessText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expertTipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Yellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expertTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  expertTipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DarkGreen,
  },
  expertTipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  diseaseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DarkGreen,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DarkGreen,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DarkGreen,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  plantText: {
    fontSize: 14,
    color: DarkGreen,
    fontWeight: '500',
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Red,
  },
  symptomText: {
    fontSize: 14,
    color: DarkGreen,
    flex: 1,
  },
  funFactCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Yellow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  funFactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  funFactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DarkGreen,
  },
  funFactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DarkGreen,
    marginTop: 12,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  didYouKnowContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Green,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  didYouKnowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DarkGreen,
    marginBottom: 8,
  },
  didYouKnowText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 100,
  },
});
