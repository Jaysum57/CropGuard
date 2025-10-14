import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDiseaseById } from "../../components/DiseaseData";

const { width } = Dimensions.get('window');
const Green = "#30BE63";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const Yellow = "#FFD94D";
const Orange = "#FF8C00";
const Red = "#E53E3E";

export default function DiseaseDetail() {
  const router = useRouter();
  const { diseaseId } = useLocalSearchParams<{ diseaseId: string }>();
  const [diseaseData, setDiseaseData] = React.useState<ReturnType<typeof getDiseaseById> extends Promise<infer T> ? T : never>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDiseaseData = async () => {
      setIsLoading(true);
      try {
        const data = await getDiseaseById(diseaseId || "");
        setDiseaseData(data);
      } catch (error) {
        console.error('Error fetching disease data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiseaseData();
  }, [diseaseId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={Green} />
          <Text style={[styles.errorText, { marginTop: 16 }]}>Loading disease information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diseaseData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={Red} />
          <Text style={styles.errorTitle}>Disease Not Found</Text>
          <Text style={styles.errorText}>The requested disease information could not be found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return Red;
      case 'high': return Orange;
      case 'moderate': return Yellow;
      default: return Green;
    }
  };

  const getSeverityBadgeColor = (severity: "Low" | "Medium" | "High") => {
    switch (severity) {
      case 'High': return Red;
      case 'Medium': return Orange;
      case 'Low': return Green;
      default: return Green;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{diseaseData.name}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityBadgeColor(diseaseData.severity) }]}>
          <Ionicons name="warning" size={16} color="#fff" />
          <Text style={styles.severityText}>{diseaseData.severity}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: diseaseData.image }}
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
              <View style={[styles.statIconContainer, { backgroundColor: getSeverityBadgeColor(diseaseData.severity) }]}>
                <Ionicons name="warning" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Risk Level</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats?.severity?.level ?? 'N/A'}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats?.severity?.score ?? '-'}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Orange }]}>
                <Ionicons name="flash" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Spread Rate</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats?.transmission?.level ?? 'N/A'}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats?.transmission?.score ?? '-'}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Green }]}>
                <Ionicons name="medical" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Treatment</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats?.treatment?.level ?? 'N/A'}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats?.treatment?.score ?? '-'}</Text>
              </View>
            </View>
            
            <View style={styles.modernStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Red }]}>
                <Ionicons name="trending-down" size={20} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCategory}>Impact</Text>
                <Text style={styles.statMainValue}>{diseaseData.quickStats?.impact?.level ?? 'N/A'}</Text>
                <Text style={styles.statScore}>{diseaseData.quickStats?.impact?.score ?? '-'}</Text>
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
            {diseaseData.symptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomCard}>
                <View style={styles.symptomHeader}>
                  <Ionicons 
                    name={symptom.icon as any} 
                    size={20} 
                    color={getSeverityColor(symptom.severity || 'low')} 
                  />
                  <Text style={styles.symptomTitle}>{symptom.title}</Text>
                  <View style={[styles.severityDot, { backgroundColor: getSeverityColor(symptom.severity || 'low') }]} />
                </View>
                <Text style={styles.symptomDescription}>{symptom.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Causes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="help-circle" size={20} color={Orange} /> What Causes This Disease
          </Text>
          {diseaseData.causes?.map((cause, index) => (
            <View key={index} style={styles.causeItem}>
              <Text style={styles.causeTitle}>{cause.title}:</Text>
              <Text style={styles.causeDescription}>{cause.description}</Text>
            </View>
          ))}
        </View>

        {/* Prevention Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="shield-checkmark" size={20} color={Green} /> Prevention Methods
          </Text>
          <View style={styles.methodsGrid}>
            {diseaseData.prevention?.map((method, index) => (
              <View key={index} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <Ionicons name={method.icon as any} size={24} color={Green} />
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    {method.difficulty && (
                      <Text style={[styles.difficultyBadge, { 
                        backgroundColor: method.difficulty === 'Easy' ? Green : 
                                        method.difficulty === 'Medium' ? Orange : Red 
                      }]}>
                        {method.difficulty}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Treatment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="medical" size={20} color={Red} /> Treatment Options
          </Text>
          <View style={styles.methodsGrid}>
            {diseaseData.treatments?.map((treatment, index) => (
              <View key={index} style={styles.treatmentCard}>
                <View style={styles.treatmentHeader}>
                  <Ionicons name={treatment.icon as any} size={24} color={Red} />
                  <View style={styles.treatmentInfo}>
                    <Text style={styles.treatmentTitle}>{treatment.title}</Text>
                    <Text style={[styles.effectivenessBadge, { 
                      backgroundColor: treatment.effectiveness === 'High' ? Green : 
                                      treatment.effectiveness === 'Moderate' ? Orange : Yellow 
                    }]}>
                      {treatment.effectiveness} Effectiveness
                    </Text>
                  </View>
                </View>
                <Text style={styles.treatmentDescription}>{treatment.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: DarkGreen,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: Green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    fontStyle: "italic",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  diseaseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
  },
  overlayContent: {
    flex: 1,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  overlayDescription: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  modernStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  modernStatCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Red,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statMainValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: DarkGreen,
  },
  statScore: {
    fontSize: 12,
    color: "#999",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cropsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cropChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: OffWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  cropText: {
    fontSize: 14,
    color: DarkGreen,
    marginLeft: 6,
    fontWeight: "500",
  },
  symptomsGrid: {
    gap: 12,
  },
  symptomCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: OffWhite,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  symptomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginLeft: 8,
    flex: 1,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  symptomDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  causeItem: {
    marginBottom: 12,
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  causeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 8,
  },
  methodsGrid: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Green,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  difficultyBadge: {
    fontSize: 10,
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  methodDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  treatmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Red,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  treatmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  treatmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  effectivenessBadge: {
    fontSize: 10,
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  treatmentDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});