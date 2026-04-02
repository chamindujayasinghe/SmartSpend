import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AppText from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppButton from "../../components/AppButton";
import colors from "../../../config/colors";
import { useThemeColors } from "../../../config/theme/colorMode";
import { supabase } from "../../../lib/Supabase-client-config";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialFirstName: string;
  initialLastName: string;
  onUpdateSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isVisible,
  onClose,
  initialFirstName,
  initialLastName,
  onUpdateSuccess,
}) => {
  const {
    secondarycolormode,
    textinputcolor,
    titlecolor,
    placeholder,
    colormode2,
  } = useThemeColors();

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    try {
      // Update the user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error) {
        Alert.alert("Error updating profile", error.message);
      } else {
        Alert.alert("Success", "Profile updated successfully!");
        onUpdateSuccess(); // Triggers any refresh logic and closes the modal
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colormode2 }]}>
            <AppText style={[styles.title, { color: titlecolor }]}>
              Edit Profile
            </AppText>

            <AppTextInput
              icon="account"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={{ backgroundColor: textinputcolor, marginBottom: 15 }}
              placeholderTextColor={placeholder}
            />

            <AppTextInput
              icon="account"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={{ backgroundColor: textinputcolor, marginBottom: 20 }}
              placeholderTextColor={placeholder}
            />

            {isUpdating ? (
              <ActivityIndicator size="large" color={colors.secondary} />
            ) : (
              <View style={styles.buttonContainer}>
                <AppButton
                  title="Cancel"
                  onPress={onClose}
                  style={styles.cancelButton}
                  textColor={colors.white}
                />
                <AppButton
                  title="Update"
                  onPress={handleUpdate}
                  style={styles.updateButton}
                  textColor={colors.white}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "85%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  cancelButton: {
    shadowColor: colors.danger,
    width: "45%",
    backgroundColor: colors.danger,
    height: 40,
    justifyContent: "center", // Vertically centers text inside button
    alignItems: "center", // Horizontally centers text inside button
  },
  updateButton: {
    width: "45%",
    backgroundColor: colors.secondary,
    height: 40,
    justifyContent: "center", // Vertically centers text inside button
    alignItems: "center", // Horizontally centers text inside button
  },
});

export default EditProfileModal;
