import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventEmitter, EVENTS } from "../../lib/eventEmitter";
import { supabase } from "../../lib/supabase";

const screenWidth = Dimensions.get("window").width;
const Green = "#30BE63";
const DarkGreen = "#021A1A";
const OffWhite = "#F6F6F6";

interface ScanHistory {
  id: string;
  disease_id: string;
  disease_name: string;      // Formatted disease name (e.g., "Early Blight")
  bucket_file_path: string; // Cloudinary URL
  accuracy_score: number;
  scanned_at: string;
  user_id: string;
}

function UserHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<ScanHistory[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScanHistory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Fetch scan history from Supabase
  const fetchScanHistory = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Error fetching user:", userError);
        Alert.alert("Error", "Please sign in to view your scan history.");
        return;
      }

      // Fetch scan history for the current user
      const { data, error } = await supabase
        .from("scan_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("scanned_at", { ascending: false });

      if (error) {
        console.error("Error fetching scan history:", error);
        Alert.alert("Error", "Failed to load scan history. Please try again.");
        return;
      }

      setHistoryData(data || []);
      setShouldRefresh(false);
    } catch (error) {
      console.error("Exception while fetching history:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchScanHistory();

    // Listen for new scan events
    const handleScanCompleted = () => {
      setShouldRefresh(true);
    };

    eventEmitter.on(EVENTS.SCAN_COMPLETED, handleScanCompleted);

    return () => {
      eventEmitter.off(EVENTS.SCAN_COMPLETED, handleScanCompleted);
    };
  }, []);

  // Refresh when shouldRefresh flag is set
  useEffect(() => {
    if (shouldRefresh) {
      fetchScanHistory(true);
    }
  }, [shouldRefresh]);

  const handleItemPress = (item: ScanHistory) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const renderHistoryItem = ({ item }: { item: ScanHistory }) => {
    const diseaseName = item.disease_name; // Use the formatted disease_name from database
    const accuracyPercent = (item.accuracy_score * 100).toFixed(1);
    const isHealthy = item.disease_name.toLowerCase().includes("healthy");

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyImageContainer}>
          <Image
            source={{ uri: item.bucket_file_path }}
            style={styles.historyImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.accuracyBadge,
              { backgroundColor: isHealthy ? Green : "#FF8C00" },
            ]}
          >
            <Text style={styles.accuracyBadgeText}>{accuracyPercent}%</Text>
          </View>
        </View>

        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <Ionicons
              name={isHealthy ? "checkmark-circle" : "alert-circle"}
              size={20}
              color={isHealthy ? Green : "#FF8C00"}
            />
            <Text style={styles.diseaseName} numberOfLines={2}>
              {diseaseName}
            </Text>
          </View>
          <View style={styles.historyFooter}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.dateText}>
              {formatDate(item.scanned_at)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="scan-outline" size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Scan History</Text>
      <Text style={styles.emptyText}>
        Start scanning plants to see your history here
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("./scan")}
      >
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSubtitle}>
            {historyData.length} {historyData.length === 1 ? "scan" : "scans"} found
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchScanHistory(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Green} />
          <Text style={styles.loadingText}>Loading your scan history...</Text>
        </View>
      ) : (
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={() => fetchScanHistory(true)}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedItem && (
              <>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Image */}
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedItem.bucket_file_path }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Details */}
                <View style={styles.modalDetails}>
                  <View style={styles.modalHeader}>
                    <Ionicons
                      name={
                        selectedItem.disease_name.toLowerCase().includes("healthy")
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={32}
                      color={
                        selectedItem.disease_name.toLowerCase().includes("healthy")
                          ? Green
                          : "#FF8C00"
                      }
                    />
                    <Text style={styles.modalDiseaseName}>
                      {selectedItem.disease_name}
                    </Text>
                  </View>

                  <View style={styles.modalInfoContainer}>
                    <View style={styles.modalInfoRow}>
                      <View style={styles.modalInfoItem}>
                        <Ionicons name="analytics" size={20} color="#666" />
                        <Text style={styles.modalInfoLabel}>Accuracy</Text>
                        <Text style={styles.modalInfoValue}>
                          {(selectedItem.accuracy_score * 100).toFixed(1)}%
                        </Text>
                      </View>

                      <View style={styles.modalInfoDivider} />

                      <View style={styles.modalInfoItem}>
                        <Ionicons name="calendar" size={20} color="#666" />
                        <Text style={styles.modalInfoLabel}>Scanned On</Text>
                        <Text style={styles.modalInfoValue}>
                          {formatDate(selectedItem.scanned_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    
    </SafeAreaView>
  );
}

export default UserHistoryScreen;

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
  refreshButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  accuracyBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  accuracyBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  historyContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  diseaseName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: DarkGreen,
    lineHeight: 20,
  },
  historyFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
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
    marginBottom: 32,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Green,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalImageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f8f8f8",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalDetails: {
    padding: 24,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalDiseaseName: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginTop: 12,
    textAlign: "center",
  },
  modalInfoContainer: {
    backgroundColor: OffWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  modalInfoDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#ddd",
    marginHorizontal: 16,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: DarkGreen,
    textAlign: "center",
  },
  doneButton: {
    backgroundColor: Green,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacing: { 
    height: 70
  },

});
