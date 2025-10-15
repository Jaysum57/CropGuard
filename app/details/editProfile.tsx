import { Ionicons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventEmitter, EVENTS } from "../../lib/eventEmitter";
import { logger } from "../../lib/logger";
import { profileCache } from "../../lib/profileCache";
import { supabase } from "../../lib/supabase";

const Green = "#30BE63";
const DarkGreen = "#021A1A";
const OffWhite = "#F6F6F6";

interface ProfileForm {
  first_name: string;
  last_name: string;
  website: string;
}

export default function EditProfile() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    website: "",
  });
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    // Get the session directly from Supabase
    const checkSessionAndFetchProfile = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (!currentSession?.user) {
          Alert.alert(
            "Authentication Required",
            "Please sign in to edit your profile",
            [
              {
                text: "OK",
                onPress: () => router.replace("/auth"),
              },
            ]
          );
          setLoading(false);
          return;
        }

        setSession(currentSession);
        await fetchProfile(currentSession);
      } catch (error) {
        logger.error("Error checking session:", error);
        Alert.alert(
          "Error",
          "Failed to verify authentication. Please try again.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
        setLoading(false);
      }
    };

    checkSessionAndFetchProfile();
  }, []);

  const fetchProfile = async (userSession: Session) => {
    if (!userSession?.user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, website")
        .eq("id", userSession.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          website: data.website || "",
        });
      }
    } catch (error) {
      logger.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileForm> = {};

    // First name validation (optional but if provided, min 2 chars)
    if (formData.first_name.trim() && formData.first_name.length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    // Last name validation (optional but if provided, min 2 chars)
    if (formData.last_name.trim() && formData.last_name.length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    // Website validation (optional but if provided, must be valid URL)
    if (formData.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveConfirmation = () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before saving");
      return;
    }
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    if (!session?.user) return;

    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before saving");
      return;
    }

    try {
      setSaving(true);
      setShowSaveModal(false);  // Close the modal

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          website: formData.website.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Invalidate cache and emit update event
      profileCache.invalidateProfile(session.user.id);
      eventEmitter.emit(EVENTS.PROFILE_UPDATED);

      logger.success("Profile updated successfully");
      Alert.alert("Success", "Your profile has been updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      logger.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Green} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Green} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Update your information</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Icon */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={Green} />
            </View>
            <Text style={styles.avatarHint}>Photo upload coming soon</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <View style={[styles.inputContainer, errors.first_name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(text) => updateField("first_name", text)}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
              {errors.first_name && (
                <Text style={styles.errorText}>{errors.first_name}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <View style={[styles.inputContainer, errors.last_name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(text) => updateField("last_name", text)}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
              {errors.last_name && (
                <Text style={styles.errorText}>{errors.last_name}</Text>
              )}
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <View style={[styles.inputContainer, errors.website && styles.inputError]}>
                <Ionicons name="globe-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(text) => updateField("website", text)}
                  placeholder="https://example.com"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!saving}
                />
              </View>
              {errors.website && (
                <Text style={styles.errorText}>{errors.website}</Text>
              )}
            </View>

            {/* Info Box */}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSaveConfirmation}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
        
        {/* Save Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSaveModal}
          onRequestClose={() => setShowSaveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="save-outline" size={48} color={Green} />
              </View>
              
              <Text style={styles.modalTitle}>Save Changes?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to update your profile information?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowSaveModal(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButtonConfirm, saving && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.modalButtonConfirmText}>Yes, Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OffWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: OffWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: Green,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Green,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatarHint: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: DarkGreen,
    marginBottom: 8,
  },
  required: {
    color: "#E53E3E",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: "#E53E3E",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: DarkGreen,
  },
  errorText: {
    fontSize: 13,
    color: "#E53E3E",
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E6F9EF",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: DarkGreen,
    marginLeft: 12,
    lineHeight: 20,
  },
  buttonSection: {
    gap: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Green,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 40,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F9EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: DarkGreen,
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalButtonConfirm: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Green,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});