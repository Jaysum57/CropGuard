import { Ionicons } from "@expo/vector-icons";
// Removed @gradio/client, will use fetch for API call
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        // Get image as blob
        const fileBlob = await fetch(asset.uri).then((r) => r.blob());
        const formData = new FormData();
        formData.append("file", fileBlob, "photo.jpg");
        const apiUrl = "https://jaysum-cropguardfastapi.hf.space/predict";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        const resultJson = await response.json();
        setResult(resultJson.predictions ?? resultJson);
        setModalVisible(true);
      }
    } catch (err) {
      let errorMsg = "Unknown error";
      if (err instanceof Error) errorMsg = err.message;
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

        // Get image as blob
        const fileBlob = await fetch(photo.uri).then((r) => r.blob());

        // Prepare form data for FastAPI
        const formData = new FormData();
        formData.append("file", fileBlob, "photo.jpg");

        // FastAPI endpoint for prediction
        const apiUrl = "https://jaysum-cropguardfastapi.hf.space/predict";
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });
        const resultJson = await response.json();
        setResult(resultJson.predictions ?? resultJson);
        setModalVisible(true);
      } catch (err) {
        let errorMsg = "Unknown error";
        if (err instanceof Error) errorMsg = err.message;
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
          <Text style={styles.buttonText}>Open Gallery test</Text>
        </View>
      </TouchableOpacity>
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
          <View style={{ position: "absolute", bottom: 40, alignSelf: "center", flexDirection: "row" }}>
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", padding: 24, borderRadius: 16, minWidth: 250 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Detection Result</Text>
            {loading ? (
              <ActivityIndicator size="large" color={Green} />
            ) : (
              <Text>{JSON.stringify(result)}</Text>
            )}
            <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => setModalVisible(false)}>
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
});