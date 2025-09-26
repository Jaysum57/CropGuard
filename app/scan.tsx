import { Ionicons } from "@expo/vector-icons";
// Removed @gradio/client, will use fetch for API call
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/fonts/images/CropGuardScanLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleStartCamera}>
        <View style={styles.buttonContent}>
          <Ionicons name="camera" size={26} color="#fff" style={styles.iconLeft} />
          <Text style={styles.buttonText}>Start Camera</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handlePickImage}>
        <View style={styles.buttonContent}>
          <Ionicons name="image" size={26} color="#fff" style={styles.iconLeft} />
          <Text style={styles.buttonText}>Open Gallery</Text>
        </View>
      </TouchableOpacity>
      {/* Test API Connection */}
      {/* <TouchableOpacity style={styles.button} onPress={testAPI}>
        <View style={styles.buttonContent}>
          <Ionicons name="wifi" size={26} color="#fff" style={styles.iconLeft} />
          <Text style={styles.buttonText}>Test API Connection</Text>
        </View>
      </TouchableOpacity> */}
      {/* Tip */}
      <View style={styles.tipContainer}>
        <Ionicons name="bulb-sharp" size={18} color={Green} style={styles.tipIcon} />
        <Text style={styles.tipText}>
          Tip: Ensure the image is clear and well-lit to improve detection
          accuracy.
        </Text>
      </View>

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

      {/* Result Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detection Result</Text>
            
            {/* Display the scanned image */}
            {photoUri && (
              <Image 
                source={{ uri: photoUri }} 
                style={styles.resultImage}
                resizeMode="cover"
              />
            )}
            
            {loading ? (
              <ActivityIndicator size="large" color={Green} />
            ) : result?.error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                <Text style={styles.errorText}>{result.error}</Text>
              </View>
            ) : result?.predictions ? (
              <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <View style={styles.predictionsContainer}>
                  <Text style={styles.predictionsTitle}>Plant Health Analysis</Text>
                  {Object.entries(result.predictions)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5) // Show top 5 predictions
                    .map(([plant, confidence], index) => {
                      const confidencePercent = ((confidence as number) * 100).toFixed(2);
                      const confidenceValue = confidence as number;
                      
                      // Color coding based on confidence levels
                      let confidenceColor = "#E53E3E"; // Red for very low confidence
                      let iconName: any = "alert-circle";
                      let confidenceLabel = "Very Low";
                      
                      if (confidenceValue >= 0.8) {
                        confidenceColor = Green; // Green for high confidence
                        iconName = "checkmark-circle";
                        confidenceLabel = "Excellent";
                      } else if (confidenceValue >= 0.6) {
                        confidenceColor = "#38A169"; // Medium green for good confidence
                        iconName = "checkmark-circle-outline";
                        confidenceLabel = "Good";
                      } else if (confidenceValue >= 0.3) {
                        confidenceColor = Yellow; // Yellow for medium confidence
                        iconName = "help-circle";
                        confidenceLabel = "Medium";
                      } else if (confidenceValue >= 0.1) {
                        confidenceColor = "#FF8C00"; // Orange for low confidence
                        iconName = "warning";
                        confidenceLabel = "Low";
                      }
                      
                      // Clean up plant name for better readability
                      const cleanPlantName = plant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      return (
                        <View key={plant} style={[styles.predictionItem, { borderLeftColor: confidenceColor }]}>
                          <View style={styles.predictionHeader}>
                            <Ionicons 
                              name={iconName} 
                              size={22} 
                              color={confidenceColor} 
                            />
                            <View style={styles.plantInfo}>
                              <Text style={styles.plantName}>{cleanPlantName}</Text>
                              <Text style={[styles.confidenceLabel, { color: confidenceColor }]}>
                                {confidenceLabel} Match
                              </Text>
                            </View>
                            <Text style={[styles.confidencePercentage, { color: confidenceColor }]}>
                              {confidencePercent}%
                            </Text>
                          </View>
                          <View style={styles.confidenceBarContainer}>
                            <View style={[styles.confidenceBar, { 
                              width: `${Math.max(2, parseFloat(confidencePercent))}%`,
                              backgroundColor: confidenceColor 
                            } as any]} />
                          </View>
                        </View>
                      );
                    })}
                  
                  {/* Summary section for the top prediction */}
                  {Object.entries(result.predictions).length > 0 && (
                    <View style={styles.summaryContainer}>
                      <Text style={styles.summaryTitle}>Diagnosis Summary</Text>
                      {(() => {
                        const topPrediction = Object.entries(result.predictions)
                          .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                        const [topPlant, topConfidence] = topPrediction;
                        const cleanTopPlant = topPlant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const isHealthy = topPlant.toLowerCase().includes('healthy');
                        const confidencePercent = ((topConfidence as number) * 100).toFixed(1);
                        
                        if ((topConfidence as number) >= 0.8) {
                          return (
                            <Text style={styles.summaryText}>
                              <Text style={styles.summaryBold}>Identified as: </Text>
                              <Text style={isHealthy ? styles.healthyText : styles.diseaseText}>
                                {cleanTopPlant}
                              </Text>
                              {'\n'}
                              <Text style={styles.summaryConfidence}>
                                Confidence: {confidencePercent}% - Highly reliable result
                              </Text>
                            </Text>
                          );
                        } else if ((topConfidence as number) >= 0.5) {
                          return (
                            <Text style={styles.summaryText}>
                              <Text style={styles.summaryBold}>Likely: </Text>
                              <Text style={isHealthy ? styles.healthyText : styles.diseaseText}>
                                {cleanTopPlant}
                              </Text>
                              {'\n'}
                              <Text style={styles.summaryConfidence}>
                                Confidence: {confidencePercent}% - Consider additional testing
                              </Text>
                            </Text>
                          );
                        } else {
                          return (
                            <Text style={styles.summaryText}>
                              <Text style={styles.summaryBold}>Uncertain diagnosis</Text>
                              {'\n'}
                              <Text style={styles.summaryConfidence}>
                                Highest match: {cleanTopPlant} ({confidencePercent}%)
                                {'\n'}Please try with a clearer image or consult an expert
                              </Text>
                            </Text>
                          );
                        }
                      })()}
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : result?.success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={24} color={Green} />
                <Text style={styles.successText}>{result.success}</Text>
              </View>
            ) : (
              <Text style={styles.fallbackText}>{JSON.stringify(result)}</Text>
            )}
            
            {/* Floating Close Button */}
            <TouchableOpacity style={styles.floatingCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
    alignItems: "center",
    padding: 24,
    marginTop: 40,
    justifyContent: "flex-start",
  },
  logo: {
    width: 300,
    height: 300,
    marginTop: 150,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Green,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginVertical: 8,
    width: "90%",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 12,
    marginTop: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    color: DarkGreen,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
    paddingHorizontal: 10,
    width: "100%",
  },
  tipIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  tipText: {
    color: DarkGreen,
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
  // Modal styles
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
  scrollContent: {
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
  confidenceContainer: {
    position: "relative",
    height: 8,
    backgroundColor: "#E9ECEF",
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    backgroundColor: Green,
    borderRadius: 3,
  },
  confidenceText: {
    position: "absolute",
    right: 4,
    top: -20,
    fontSize: 12,
    fontWeight: "600",
    color: DarkGreen,
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