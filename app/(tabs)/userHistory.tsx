import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  View
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
  disease_name: string;
  bucket_file_path: string;
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ScanHistory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchScanHistory = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Error fetching user:", userError);
        Alert.alert("Error", "Please sign in to view your scan history.");
        return;
      }

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
    } catch (error) {
      console.error("Exception while fetching history:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("scan_activity")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) {
        console.error("Error deleting scan:", error);
        Alert.alert("Error", "Failed to delete scan. Please try again.");
        return;
      }

      // Remove from local state
      setHistoryData(prev => prev.filter(item => item.id !== itemToDelete.id));
      
      // Close modals
      setDeleteModalVisible(false);
      setModalVisible(false);
      setItemToDelete(null);
      setSelectedItem(null);

      // **CRITICAL: Emit event to notify other screens**
      eventEmitter.emit(EVENTS.SCAN_COMPLETED);

      Alert.alert("Success", "Scan deleted successfully");
    } catch (error) {
      console.error("Exception while deleting:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (item: ScanHistory) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchScanHistory(true);
    }, [])
  );

  // Listen for scan completion events
  useEffect(() => {
    const handleScanCompleted = () => {
      fetchScanHistory(true);
    };

    eventEmitter.on(EVENTS.SCAN_COMPLETED, handleScanCompleted);

    return () => {
      eventEmitter.off(EVENTS.SCAN_COMPLETED, handleScanCompleted);
    };
  }, []);

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

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleTimeString("en-US", options);
  };

  const getAccuracyColor = (score: number) => {
    const percentage = score * 100;
    if (percentage < 70) return "#FF4444"; // Red - Low confidence
    if (percentage < 85) return "#FF8C00"; // Orange - Medium confidence
    return Green; // Green - High confidence
  };

  const renderHistoryItem = ({ item }: { item: ScanHistory }) => {
    const diseaseName = item.disease_name;
    const accuracyPercent = (item.accuracy_score * 100).toFixed(1);
    const isHealthy = item.disease_name.toLowerCase().includes("healthy");
    const accuracyColor = getAccuracyColor(item.accuracy_score);

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
              { backgroundColor: accuracyColor },
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

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            confirmDelete(item);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedItem.bucket_file_path }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  {/* Status Tag/Chip */}
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: selectedItem.disease_name.toLowerCase().includes("healthy")
                          ? Green
                          : "#FF8C00"
                      }
                    ]}
                  >
                    <Ionicons
                      name={
                        selectedItem.disease_name.toLowerCase().includes("healthy")
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.statusChipText}>
                      {selectedItem.disease_name.toLowerCase().includes("healthy")
                        ? "Healthy"
                        : "Disease Detected"}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  {/* Disease Name Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalDiseaseName}>
                      {selectedItem.disease_name}
                    </Text>
                  </View>

                  {/* Info Cards Vertical Layout */}
                  <View style={styles.infoCardsContainer}>
                    {/* Accuracy Card */}
                    <View style={[
                      styles.infoCard, 
                      styles.accuracyCard,
                      { 
                        borderColor: getAccuracyColor(selectedItem.accuracy_score),
                        backgroundColor: getAccuracyColor(selectedItem.accuracy_score) + '15' // 15% opacity
                      }
                    ]}>
                      <View style={styles.infoCardIcon}>
                        <Ionicons 
                          name="analytics" 
                          size={28} 
                          color={getAccuracyColor(selectedItem.accuracy_score)} 
                        />
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>Accuracy</Text>
                        <Text style={[
                          styles.infoCardValue, 
                          { color: getAccuracyColor(selectedItem.accuracy_score) }
                        ]}>
                          {(selectedItem.accuracy_score * 100).toFixed(1)}%
                        </Text>
                      </View>
                    </View>

                    {/* Date Card */}
                    <View style={styles.infoCard}>
                      <View style={styles.infoCardIcon}>
                        <Ionicons name="calendar-outline" size={28} color="#666" />
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>Date</Text>
                        <Text style={styles.infoCardValue}>
                          {formatDateOnly(selectedItem.scanned_at)}
                        </Text>
                      </View>
                    </View>

                    {/* Time Card */}
                    <View style={styles.infoCard}>
                      <View style={styles.infoCardIcon}>
                        <Ionicons name="time-outline" size={28} color="#666" />
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>Time</Text>
                        <Text style={styles.infoCardValue}>
                          {formatTimeOnly(selectedItem.scanned_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={styles.deleteModalButton}
                      onPress={() => confirmDelete(selectedItem)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                      <Text style={styles.deleteModalButtonText}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmContainer}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="trash" size={48} color="#FF4444" />
            </View>

            <Text style={styles.deleteTitle}>Delete Scan?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this scan? This action cannot be undone.
            </Text>

            {itemToDelete && (
              <View style={styles.deletePreview}>
                <Image
                  source={{ uri: itemToDelete.bucket_file_path }}
                  style={styles.deletePreviewImage}
                  resizeMode="cover"
                />
                <Text style={styles.deletePreviewText} numberOfLines={2}>
                  {itemToDelete.disease_name}
                </Text>
              </View>
            )}

            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteButton, deleting && styles.disabledButton]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  statusChip: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statusChipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  modalDetails: {
    padding: 24,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalDiseaseName: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    textAlign: "center",
  },
  infoCardsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9ECEF",
  },
  accuracyCard: {
    // Dynamic colors applied inline based on accuracy score
  },
  infoCardIcon: {
    marginRight: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
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
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  deleteModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  doneButton: {
    flex: 1,
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
  deleteConfirmContainer: {
    width: screenWidth * 0.85,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  deletePreview: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: OffWhite,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  deletePreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  deletePreviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: DarkGreen,
  },
  deleteButtonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: OffWhite,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FF4444",
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.6,
  },
  bottomSpacing: { 
    height: 70
  },
});