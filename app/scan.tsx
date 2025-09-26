import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");
const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";

function ScanScreen() {
  // ...existing code...
  const handlePickImage = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        // Create FormData with proper file structure for Android
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          type: "image/jpeg",
          name: "photo.jpg",
        } as any);
        const apiUrl = "https://jaysum-cropguardfastapi.hf.space/predict";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultJson = await response.json();
        setResult(resultJson);
        setModalVisible(true);
      }
    } catch (err) {
      let errorMsg = "Network request failed";
      if (err instanceof Error) {
        errorMsg = `${err.name}: ${err.message}`;
        console.error("Image picker prediction error:", err);
      }
      setResult({ error: errorMsg });
      setModalVisible(true);
    }
    setLoading(false);
  };
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);

  const testAPI = async () => {
    setLoading(true);
    try {
      const apiUrl = "https://jaysum-cropguardfastapi.hf.space/";
      console.log("Testing API connection to:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const resultJson = await response.json();
      console.log("API Response:", resultJson);
      setResult({ success: "API connection successful", data: resultJson });
      setModalVisible(true);
    } catch (err) {
      console.error("API test error:", err);
      let errorMsg = "API test failed";
      if (err instanceof Error) {
        errorMsg = `${err.name}: ${err.message}`;
      }
      setResult({ error: errorMsg });
      setModalVisible(true);
    }
    setLoading(false);
  };

  const handleStartCamera = () => {
    setCameraOpen(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: false });
        setPhotoUri(photo.uri);
        setCameraOpen(false);

        // Prepare form data for FastAPI - Android compatible format
        const formData = new FormData();
        formData.append("file", {
          uri: photo.uri,
          type: "image/jpeg",
          name: "photo.jpg",
        } as any);

        // FastAPI endpoint for prediction
        const apiUrl = "https://jaysum-cropguardfastapi.hf.space/predict";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultJson = await response.json();
        setResult(resultJson);
        setModalVisible(true);
      } catch (err) {
        let errorMsg = "Network request failed";
        if (err instanceof Error) {
          errorMsg = `${err.name}: ${err.message}`;
          console.error("Camera prediction error:", err);
        }
        setResult({ error: errorMsg });
        setModalVisible(true);
      }
      setLoading(false);
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Plant Disease Scanner</Text>
          <Text style={styles.headerSubtitle}>
            Use AI-powered detection to identify plant diseases instantly
          </Text>
        </View>

        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroImageWrapper}>
            <Image
              source={require("../assets/fonts/images/CropGuardScanLogo.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <View style={styles.heroOverlay}>
              <Ionicons name="scan" size={60} color={Green} />
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Choose Scanning Method</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryCard]} 
            onPress={handleStartCamera}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <View style={[styles.actionIcon, { backgroundColor: Green }]}>
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Scan with Camera</Text>
              <Text style={styles.actionDescription}>
                Take a photo directly with your camera for instant analysis
              </Text>
              <View style={styles.actionBadge}>
                <Text style={styles.badgeText}>Recommended</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <View style={[styles.actionIcon, { backgroundColor: "#8B5CF6" }]}>
                <Ionicons name="images" size={32} color="#fff" />
              </View>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Choose from Gallery</Text>
              <Text style={styles.actionDescription}>
                Select an existing photo from your device gallery
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Instructions Section */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>How to Get Best Results</Text>
          
          <View style={styles.instructionCard}>
            <View style={[styles.instructionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="sunny" size={24} color="#1976D2" />
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Good Lighting</Text>
              <Text style={styles.instructionText}>
                Use natural daylight or bright indoor lighting for clear photos
              </Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <View style={[styles.instructionIcon, { backgroundColor: "#E8F5E8" }]}>
              <Ionicons name="leaf" size={24} color={Green} />
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Focus on Affected Areas</Text>
              <Text style={styles.instructionText}>
                Center the diseased or damaged parts of the plant in your photo
              </Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <View style={[styles.instructionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="camera-outline" size={24} color="#F57C00" />
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Hold Steady</Text>
              <Text style={styles.instructionText}>
                Keep your device stable and close enough to capture details
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Detection Capabilities</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25+</Text>
              <Text style={styles.statLabel}>Plant Types</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Diseases</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            ref={cameraRef}
          />
          <View style={styles.cameraButtonContainer}>
            {/* <TouchableOpacity style={[styles.button, { marginRight: 10 }]} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={handleTakePicture} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Processing..." : "Capture"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redesigned Modern Result Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContainer}>
            {/* Modern Header */}
            <View style={styles.modernModalHeader}>
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="scan" size={24} color="#fff" />
                </View>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modernModalTitle}>Scan Results</Text>
                  <Text style={styles.modalSubtitle}>AI-Powered Plant Analysis</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.modernCloseButton} 
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>


              {/* Image Preview Section */}
              {photoUri && (
                <View style={styles.imagePreviewSection}>
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: photoUri }} 
                      style={styles.modernResultImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlayBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.imageOverlayText}>Analyzed</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Loading State */}
              {loading ? (
                <View style={styles.modernLoadingContainer}>
                  <ActivityIndicator size="large" color={Green} />
                  <Text style={styles.loadingText}>Analyzing your plant...</Text>
                  <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
                </View>
              ) : result?.error ? (
                <View style={styles.modernErrorContainer}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
                  </View>
                  <Text style={styles.modernErrorTitle}>Analysis Failed</Text>
                  <Text style={styles.modernErrorText}>{result.error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => setModalVisible(false)}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : result?.predictions ? (
                <ScrollView 
                  style={styles.modernModalContent} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollContainer}
                >
                {/* Modern Results Section */}
                <View style={styles.modernResultsSection}>
                  <View style={styles.resultsSectionHeader}>
                    <Ionicons name="analytics" size={24} color={Green} />
                    <Text style={styles.modernResultsTitle}>Analysis Results</Text>
                  </View>
                  
                  {/* Top Prediction Card */}
                  {(() => {
                    const topPrediction = Object.entries(result.predictions)
                      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                    const [topPlant, topConfidence] = topPrediction;
                    const cleanTopPlant = topPlant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const confidencePercent = ((topConfidence as number) * 100).toFixed(1);
                    const isHealthy = topPlant.toLowerCase().includes('healthy');
                    
                    let statusColor = "#E53E3E";
                    let statusIcon = "alert-circle";
                    let statusText = "Needs Attention";
                    
                    if ((topConfidence as number) >= 0.8) {
                      statusColor = isHealthy ? Green : "#FF8C00";
                      statusIcon = isHealthy ? "checkmark-circle" : "warning";
                      statusText = isHealthy ? "Healthy Plant" : "Disease Detected";
                    } else if ((topConfidence as number) >= 0.5) {
                      statusColor = "#FF8C00";
                      statusIcon = "help-circle";
                      statusText = "Uncertain";
                    }

                    return (
                      <View style={styles.topPredictionCard}>
                        <View style={styles.topPredictionHeader}>
                          <View style={[styles.statusIconContainer, { backgroundColor: statusColor }]}>
                            <Ionicons name={statusIcon as any} size={28} color="#fff" />
                          </View>
                          <View style={styles.topPredictionInfo}>
                            <Text style={styles.statusText}>{statusText}</Text>
                            <Text style={styles.topPredictionName}>{cleanTopPlant}</Text>
                            <View style={styles.confidenceContainer}>
                              <Text style={styles.confidenceText}>Confidence: </Text>
                              <Text style={[styles.confidenceValue, { color: statusColor }]}>
                                {confidencePercent}%
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.topPredictionBar}>
                          <View style={[styles.topPredictionProgress, { 
                            width: `${Math.max(5, parseFloat(confidencePercent))}%`,
                            backgroundColor: statusColor 
                          }]} />
                        </View>
                      </View>
                    );
                  })()}

                  {/* Additional Predictions */}
                  <View style={styles.additionalPredictions}>
                    <Text style={styles.additionalPredictionsTitle}>Other Possibilities</Text>
                    {Object.entries(result.predictions)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(1, 4) // Show next 3 predictions
                      .map(([plant, confidence], index) => {
                        const confidencePercent = ((confidence as number) * 100).toFixed(1);
                        const cleanPlantName = plant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        
                        return (
                          <View key={plant} style={styles.additionalPredictionItem}>
                            <View style={styles.additionalPredictionContent}>
                              <Text style={styles.additionalPlantName}>{cleanPlantName}</Text>
                              <Text style={styles.additionalConfidence}>{confidencePercent}%</Text>
                            </View>
                            <View style={styles.additionalPredictionBar}>
                              <View style={[styles.additionalProgress, { 
                                width: `${Math.max(2, parseFloat(confidencePercent))}%`
                              }]} />
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </View>
                <View style={styles.recommendationsSection}>
                  <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
                  {(() => {
                    const topPrediction = Object.entries(result.predictions)
                      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                    const [topPlant] = topPrediction;
                    const isHealthy = topPlant.toLowerCase().includes('healthy');
                    
                    return (
                      <View style={styles.recommendationsList}>
                        {isHealthy ? (
                          <>
                            <View style={styles.recommendationItem}>
                              <Ionicons name="checkmark-circle" size={20} color={Green} />
                              <Text style={styles.recommendationText}>Continue current care routine</Text>
                            </View>
                            <View style={styles.recommendationItem}>
                              <Ionicons name="eye" size={20} color={Green} />
                              <Text style={styles.recommendationText}>Monitor for any changes</Text>
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={styles.recommendationItem}>
                              <Ionicons name="information-circle" size={20} color="#FF8C00" />
                              <Text style={styles.recommendationText}>Learn more about this condition</Text>
                            </View>
                            <View style={styles.recommendationItem}>
                              <Ionicons name="people" size={20} color="#FF8C00" />
                              <Text style={styles.recommendationText}>Consult with plant experts</Text>
                            </View>
                            <View style={styles.recommendationItem}>
                              <Ionicons name="camera" size={20} color="#FF8C00" />
                              <Text style={styles.recommendationText}>Take more photos if needed</Text>
                            </View>
                          </>
                        )}
                      </View>
                    );
                  })()}
                </View>
                </ScrollView>
            ) : result?.success ? (
              <View style={styles.modernSuccessContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={32} color={Green} />
                </View>
                <Text style={styles.modernSuccessTitle}>Connection Successful</Text>
                <Text style={styles.modernSuccessText}>{result.success}</Text>
              </View>
            ) : (
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackTitle}>Raw Response</Text>
                <Text style={styles.fallbackText}>{JSON.stringify(result, null, 2)}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ScanScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: DarkGreen,
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  // Hero Section
  heroContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroImageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  heroImage: {
    width: 120,
    height: 120,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  // Actions Section
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 16,
    textAlign: "center",
  },
  actionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 2,
    borderColor: "transparent",
  },
  primaryCard: {
    borderColor: Green,
    backgroundColor: "#F0FFF4",
  },
  actionIconContainer: {
    marginRight: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  actionBadge: {
    backgroundColor: Green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  // Instructions Section
  instructionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  instructionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  instructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    backgroundColor: OffWhite,
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
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

  bottomSpacing: {
    height: 40,
  },

  // Legacy styles for camera permissions
  container: {
    flex: 1,
    backgroundColor: OffWhite,
    alignItems: "center",
    padding: 24,
    marginTop: 40,
    justifyContent: "center",
  },
  button: {
    backgroundColor: Green,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginVertical: 8,
    minWidth: 200,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    color: DarkGreen,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  // Modern Modal styles
  modernModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modernModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    flex: 1,
    maxHeight: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  modernCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modernModalContent: {
    flex: 1,
    paddingBottom: 0,
  },
  modalScrollContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  imagePreviewSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  modernResultImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  imageOverlayBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(48, 190, 99, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modernLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: DarkGreen,
    marginTop: 16,
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
  },
  modernErrorContainer: {
    padding: 24,
    alignItems: "center",
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modernErrorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E53E3E",
    marginBottom: 8,
  },
  modernErrorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modernResultsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  modernResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
  },
  topPredictionCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Green,
  },
  topPredictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  topPredictionInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  topPredictionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 6,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceText: {
    fontSize: 14,
    color: "#666",
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  topPredictionBar: {
    height: 6,
    backgroundColor: "#E9ECEF",
    borderRadius: 3,
    overflow: "hidden",
  },
  topPredictionProgress: {
    height: "100%",
    borderRadius: 3,
  },
  additionalPredictions: {
    marginTop: 8,
  },
  additionalPredictionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DarkGreen,
    marginBottom: 12,
  },
  additionalPredictionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  additionalPredictionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  additionalPlantName: {
    fontSize: 14,
    fontWeight: "500",
    color: DarkGreen,
    flex: 1,
  },
  additionalConfidence: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  additionalPredictionBar: {
    height: 4,
    backgroundColor: "#F8F9FA",
    borderRadius: 2,
    overflow: "hidden",
  },
  additionalProgress: {
    height: "100%",
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  recommendationsSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DarkGreen,
    marginBottom: 12,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  modernSuccessContainer: {
    padding: 24,
    alignItems: "center",
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modernSuccessTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Green,
    marginBottom: 8,
  },
  modernSuccessText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  fallbackContainer: {
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DarkGreen,
    marginBottom: 12,
  },
  // Legacy Modal styles (keeping for compatibility)
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    maxWidth: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollContainer: {
    maxHeight: 400,
    marginVertical: 10,
    marginBottom: 60, // Space for floating button
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    textAlign: "center",
    marginBottom: 16,
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Green,
  },
  predictionsContainer: {
    marginVertical: 12,
  },
  predictionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: DarkGreen,
    marginBottom: 12,
    textAlign: "center",
  },
  predictionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Green,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "600",
    color: DarkGreen,
    lineHeight: 20,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  confidencePercentage: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "right",
  },
  confidenceBarContainer: {
    height: 6,
    backgroundColor: "#E9ECEF",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },

  summaryContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B0E0E6",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 12,
    textAlign: "center",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: DarkGreen,
  },
  summaryBold: {
    fontWeight: "bold",
  },
  summaryConfidence: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  healthyText: {
    color: Green,
    fontWeight: "600",
  },
  diseaseText: {
    color: "#E53E3E",
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7D7",
    marginVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#E53E3E",
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C6F6D5",
    marginVertical: 12,
  },
  successText: {
    fontSize: 14,
    color: Green,
    marginLeft: 8,
    flex: 1,
  },
  fallbackText: {
    fontSize: 14,
    color: DarkGreen,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    fontFamily: "monospace",
  },
  closeButton: {
    marginTop: 12,
    alignSelf: "center",
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  floatingCloseButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: Green,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 80,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});