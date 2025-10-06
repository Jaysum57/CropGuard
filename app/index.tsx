import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth * 0.7;
const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";

type Disease = {
  title: string;
  description: string;
  image?: any;
  page: "/details/rust" | "/details/disease";
  tag: string;
  severity: "Low" | "Medium" | "High";
  color: string;
};

const diseases: Disease[] = [
  {
    title: "Rust",
    description: "Fungal disease causing orange-brown pustules on plant leaves and stems.",
    image: require("../assets/fonts/images/rust.jpg"),
    page: "/details/rust",
    tag: "Fungal",
    severity: "High",
    color: "#E53E3E",
  },
  {
    title: "Powdery Mildew",
    description: "White powdery fungus that affects leaf surfaces and reduces photosynthesis.",
    page: "/details/disease",
    tag: "Fungal",
    severity: "Medium",
    color: "#FF8C00",
  },
  {
    title: "Leaf Spot",
    description: "Circular dark spots caused by fungal or bacterial infections.",
    page: "/details/disease",
    tag: "Bacterial",
    severity: "Low",
    color: "#38A169",
  },
];

const quickActions = [
  {
    title: "Scan Plant",
    description: "Take a photo to identify diseases",
    icon: "camera" as const,
    color: Green,
    route: "/scan" as const,
  },
  {
    title: "Disease Library",
    description: "Browse common plant diseases",
    icon: "library" as const,
    color: "#8B5CF6",
    route: "/details/disease" as const,
  },
];

const user = {
  name: "Leonardo",
  plantsScanned: 47,
  lastScan: "2 hours ago",
};

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Modern Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userNameText}>{user.name}! 👋</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/account")}>
              <Ionicons name="person-circle" size={40} color={Green} />
            </TouchableOpacity>
          </View>
          
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.plantsScanned}</Text>
              <Text style={styles.statLabel}>Plants Scanned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.lastScan}</Text>
              <Text style={styles.statLabel}>Last Scan</Text>
            </View>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Protect Your Plants</Text>
            <Text style={styles.heroSubtitle}>
              Use AI-powered disease detection to keep your crops healthy and thriving
            </Text>
          </View>
          <View style={styles.heroIconContainer}>
            <Ionicons name="leaf" size={30} color={Green} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={() => router.push(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disease Library */}
        <View style={styles.diseaseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Common Plant Diseases</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push("/details/disease")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color={Green} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={diseases}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.diseaseCardsContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.diseaseCard}
                activeOpacity={0.9}
                onPress={() => router.push(item.page)}
              >
                <View style={styles.diseaseImageContainer}>
                  {item.image ? (
                    <Image source={item.image} style={styles.diseaseImage} />
                  ) : (
                    <View style={styles.diseaseImagePlaceholder}>
                      <Ionicons name="leaf" size={40} color={Green} />
                    </View>
                  )}
                  <View style={[styles.severityBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </View>
                
                <View style={styles.diseaseContent}>
                  <View style={styles.diseaseHeader}>
                    <Text style={styles.diseaseTitle}>{item.title}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: item.tag === "Fungal" ? "#FFF3CD" : "#E1F5FE" }]}>
                      <Text style={[styles.tagText, { 
                        color: item.tag === "Fungal" ? "#856404" : "#0277BD" 
                      }]}>{item.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.diseaseDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Plant Care Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={Yellow} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Prevention is Key</Text>
              <Text style={styles.tipText}>
                Regular monitoring and proper plant spacing can prevent most diseases from spreading.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 120,
    backgroundColor: "#fff",
  },

  // Header Section
  headerSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: DarkGreen,
  },
  profileButton: {
    padding: 4,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: OffWhite,
    // borderColor: "#E0E0E0",
    // borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Green,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
  },

  // Hero Section
  heroSection: {
    backgroundColor: Green,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroContent: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 20,
  },
  heroIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 60,
    backgroundColor: OffWhite,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 16,
  },
  actionGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // Disease Section
  diseaseSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: OffWhite,
    borderRadius: 20,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: Green,
    fontWeight: "600",
    marginRight: 4,
  },
  diseaseCardsContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 12,
  },
  diseaseCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 16,
    width: CARD_WIDTH,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  diseaseImageContainer: {
    position: "relative",
    height: 140,
    backgroundColor: OffWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  diseaseImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  diseaseImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: OffWhite,
  },
  severityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  diseaseContent: {
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    flex: 1,
    marginRight: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  diseaseDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Yellow,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 0,
  },
});