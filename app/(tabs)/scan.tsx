import { Ionicons } from "@expo/vector-icons";
import { Session } from '@supabase/supabase-js';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { eventEmitter, EVENTS } from "../../lib/eventEmitter";
import { supabase } from "../../lib/supabase";

const { width: screenWidth } = Dimensions.get("window");
const Green = "#30BE63";
const Yellow = "#FFD94D";
const OffWhite = "#F6F6F6";
const DarkGreen = "#021A1A";
const BUCKET_NAME = 'plants_scanned'; // Your Supabase Bucket Name

function ScanScreen() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingVisible, setProcessingVisible] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cameraRef = useRef<any>(null);

  // --- NEW UTILITY FUNCTIONS ---

  /**
   * Logs a successful scan event to the minimal 'scan_activity' table.
   * This is crucial for counting user scans later without heavy bucket operations.
   */
  const logScanActivity = async (diseaseId: string, bucketFilePath: string, accuracyScore: number) => {
    if (!session?.user) {
      console.error("Cannot log scan: No authenticated user");
      Alert.alert(
        "Authentication Required",
        "Please sign in to save your scan history.",
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
      return;
    }

    try {
      console.log("Accuracy score:", accuracyScore);
      const { error } = await supabase
        .from('scan_activity')
        .insert([
          { 
            disease_id: diseaseId,
            bucket_file_path: bucketFilePath,
            user_id: session.user.id,  // Explicitly set user_id
            accuracy_score: accuracyScore  // Add accuracy score
          }
        ]);

      if (error) {
        console.error("Supabase Logging Error (scan_activity):", error.message);
        if (error.code === 'PGRST301') {
          Alert.alert(
            "Permission Error",
            "You don't have permission to save scans. Please sign in again.",
            [{ text: "OK", onPress: () => setModalVisible(false) }]
          );
        } else {
          Alert.alert(
            "Error",
            "Failed to save scan history. Please try again.",
            [{ text: "OK", onPress: () => setModalVisible(false) }]
          );
        }
      } else {
        console.log("Scan logged successfully to scan_activity.");
        // Emit event to notify other screens to refresh their stats
        eventEmitter.emit(EVENTS.SCAN_COMPLETED, {
          diseaseId,
          accuracyScore,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Exception during logging:", e);
      Alert.alert(
        "Error",
        "Failed to save scan history. Please try again.",
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
    }
  };

  /**
   * Uploads a local file URI to Supabase Storage and returns the file path.
   */
  const uploadToBucket = async (uri: string): Promise<string | null> => {
    if (!session?.user) {
      console.error("No authenticated user session found for upload.");
      Alert.alert(
        "Sign In Required",
        "Please sign in to save your scans.",
        [
          { text: "OK", onPress: () => setModalVisible(false) }
        ]
      );
      return null;
    }

    // 2. Prepare file metadata
    const fileExt = uri.split('.').pop() || 'jpg';
    // Create a unique path: e.g., 'user_id/timestamp.jpg'
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
    
    // 3. Prepare the file/blob structure for React Native
    const file = {
      uri: uri,
      name: filePath, 
      type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
    } as any; 

    try {
      // 4. Perform the upload
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError.message);
        return null;
      }
      
      // 5. Return the full file path 
      return filePath;

    } catch (e) {
      console.error("General Upload Error:", e);
      return null;
    }
  };

  // --- HANDLERS (UPDATED) ---

  const handlePickImage = async () => {
    setLoading(true);
    let assetUri: string | null = null;

    try {
      // 1. Request permissions 
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert("Sorry, we need camera roll permissions to make this work!");
        setLoading(false);
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: false,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        assetUri = asset.uri; // Store the URI for upload/API call
        setPhotoUri(assetUri);
        
        // Show processing modal before API call
        setProcessingVisible(true);
        
        // 2. Call FastAPI
        const formData = new FormData();
        formData.append("file", {
          uri: assetUri,
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

        // 3. LOGIC FOR UPLOAD & LOGGING
        const topPredictionEntry = Object.entries(resultJson.predictions)
            .sort(([, a], [, b]) => (b as number) - (a as number))[0];
        const topDiseaseId = topPredictionEntry ? topPredictionEntry[0] : null;

        if (assetUri && topDiseaseId) { 
          // A. Upload the image to the Supabase Bucket
          const uploadedPath = await uploadToBucket(assetUri);
          
          if (uploadedPath) {
            // B. Log the successful scan with the image path and prediction
            const accuracyScore = topPredictionEntry[1] as number;
            await logScanActivity(topDiseaseId, uploadedPath, accuracyScore);
          }
        }
        
        // 4. Show results
        setProcessingVisible(false);
        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      }
    } catch (err) {
      let errorMsg = "Network request failed";
      if (err instanceof Error) {
        errorMsg = `${err.name}: ${err.message}`;
        console.error("Image picker prediction error:", err);
      }
      setResult({ error: errorMsg });
      
      // Hide processing modal and show error
      setProcessingVisible(false);
      setTimeout(() => {
        setModalVisible(true);
      }, 300);
    }
    setLoading(false);
  };
  
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      let photoUriFromCamera: string | null = null;
      
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: false });
        photoUriFromCamera = photo.uri; // Store the URI from the camera
        setPhotoUri(photoUriFromCamera);
        setCameraOpen(false);

        // Show processing modal before API call
        setProcessingVisible(true);

        // 1. Call FastAPI
        const formData = new FormData();
        formData.append("file", {
          uri: photoUriFromCamera,
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
        
        // 2. LOGIC FOR UPLOAD & LOGGING
        const topPredictionEntry = Object.entries(resultJson.predictions)
            .sort(([, a], [, b]) => (b as number) - (a as number))[0];
        const topDiseaseId = topPredictionEntry ? topPredictionEntry[0] : null;

        if (photoUriFromCamera && topDiseaseId) {
          // A. Upload the image to the Supabase Bucket
          const uploadedPath = await uploadToBucket(photoUriFromCamera);
          
          if (uploadedPath) {
            // B. Log the successful scan with the image path and prediction
            const accuracyScore = topPredictionEntry[1] as number;
            await logScanActivity(topDiseaseId, uploadedPath, accuracyScore);
          }
        }

        // 3. Show results
        setProcessingVisible(false);
        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      } catch (err) {
        let errorMsg = "Network request failed";
        if (err instanceof Error) {
          errorMsg = `${err.name}: ${err.message}`;
          console.error("Camera prediction error:", err);
        }
        setResult({ error: errorMsg });
        
        // Hide processing modal and show error
        setProcessingVisible(false);
        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      }
      setLoading(false);
    }
  };

  // --- UNCHANGED HANDLERS ---
  const testAPI = async () => {
    // ... (unchanged) ...
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

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  }

  function handleCloseCamera() {
    setCameraOpen(false);
  }

  // --- UNCHANGED RENDERING/JSX ---

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
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
              source={require("../../assets/images/CropGuardScanLogo.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
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

      {/* Modern Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide" statusBarTranslucent>
        <View style={styles.modernCameraContainer}>
          <CameraView
            style={styles.modernCameraView}
            facing={facing}
            flash={flash}
            ref={cameraRef}
          />
          
          {/* Camera Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top Controls */}
            <View style={styles.cameraTopControls}>
              <TouchableOpacity 
                style={styles.cameraControlButton} 
                onPress={handleCloseCamera}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.cameraTopRight}>
                <TouchableOpacity 
                  style={[styles.cameraControlButton, flash === 'on' && styles.activeFlashButton]} 
                  onPress={toggleFlash}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={flash === 'off' ? "flash-off" : "flash"} 
                    size={24} 
                    color={flash === 'on' ? "#FFD700" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Focus Area */}
            <View style={styles.cameraFocusArea}>
              <View style={styles.focusFrame}>
                <View style={styles.focusCorner} />
                <View style={[styles.focusCorner, styles.focusCornerTopRight]} />
                <View style={[styles.focusCorner, styles.focusCornerBottomLeft]} />
                <View style={[styles.focusCorner, styles.focusCornerBottomRight]} />
              </View>
              <Text style={styles.focusText}>Position plant disease within frame</Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.cameraBottomControls}>
              <View style={styles.cameraBottomRow}>
                {/* Gallery Button */}
                <TouchableOpacity 
                  style={styles.galleryButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity 
                  style={[styles.captureButton, loading && styles.captureButtonDisabled]} 
                  onPress={handleTakePicture} 
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : (
                    <View style={styles.captureButtonInner}>
                      <Ionicons name="camera" size={32} color={Green} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Flip Camera Button */}
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-reverse" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {/* Instructions */}
              <Text style={styles.cameraInstructions}>
                Tap to capture • Ensure good lighting for best results
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Modal */}
      <Modal visible={processingVisible} transparent animationType="fade">
        <View style={styles.processingModalOverlay}>
          <View style={styles.processingModalContainer}>
            {/* Processing Animation */}
            <View style={styles.processingAnimationContainer}>
              <View style={styles.processingCircle}>
                <ActivityIndicator size="large" color={Green} />
              </View>
            </View>
            
            {/* Processing Text */}
            <Text style={styles.processingTitle}>Analyzing Plant</Text>
            <Text style={styles.processingSubtitle}>
              Our AI is examining your photo for disease detection...
            </Text>
            
            {/* Progress Indicator */}
            <View style={styles.processingProgress}>
              <View style={styles.processingProgressBar}>
                <View style={styles.processingProgressFill} />
              </View>
              <Text style={styles.processingProgressText}>Please wait</Text>
            </View>
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
    paddingBottom: 40,
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
    paddingVertical: 2,
    paddingHorizontal: 20,
  },
  heroImageWrapper: {
    marginBottom: 1,
  },
  heroImage: {
    width: 160,
    height: 160,
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
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modernModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    flex: 1,
    width: "100%",
    maxWidth: 400,
    maxHeight: "95%",
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
    paddingBottom: 24,
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

  // Modern Camera Modal Styles
  modernCameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  modernCameraView: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  cameraTopControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  cameraTopRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeFlashButton: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cameraFocusArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  focusFrame: {
    width: 250,
    height: 250,
    position: "relative",
    marginBottom: 20,
  },
  focusCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  focusCornerTopRight: {
    transform: [{ rotate: "90deg" }],
    top: 0,
    right: 0,
    left: "auto",
  },
  focusCornerBottomLeft: {
    transform: [{ rotate: "-90deg" }],
    bottom: 0,
    left: 0,
    top: "auto",
  },
  focusCornerBottomRight: {
    transform: [{ rotate: "180deg" }],
    bottom: 0,
    right: 0,
    top: "auto",
    left: "auto",
  },
  focusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraBottomControls: {
    alignItems: "center",
  },
  cameraBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  captureButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Green,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cameraInstructions: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontWeight: "500",
  },

  // Processing Modal Styles
  processingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  processingModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    minWidth: 280,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  processingAnimationContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  processingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FFF4",
    justifyContent: "center",
    alignItems: "center",
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 8,
    textAlign: "center",
  },
  processingSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  processingProgress: {
    width: "100%",
    alignItems: "center",
  },
  processingProgressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  processingProgressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: Green,
    borderRadius: 2,
  },
  processingProgressText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
});