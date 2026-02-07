import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import colors from "../../../../config/colors";
import AppText from "../../../components/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CameraLayoutProps {
  onClose: () => void;
  onPhotoCaptured: (base64Array: string[]) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CameraLayout: React.FC<CameraLayoutProps> = ({
  onClose,
  onPhotoCaptured,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewIndex, setViewIndex] = useState(0); // Track which image we are viewing
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    requestPermission();
    return <View />;
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2,
      });
      if (photo?.base64) {
        const newImages = [...capturedImages, photo.base64];
        setCapturedImages(newImages);
        setViewIndex(newImages.length - 1);
        setIsPreviewMode(true);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.2,
    });
    if (!result.canceled && result.assets[0].base64) {
      const newImages = [...capturedImages, result.assets[0].base64];
      setCapturedImages(newImages);
      setViewIndex(newImages.length - 1);
      setIsPreviewMode(true);
    }
  };
  const handleDeleteImage = () => {
    const updatedImages = capturedImages.filter(
      (_, index) => index !== viewIndex,
    );

    if (updatedImages.length === 0) {
      setCapturedImages([]);
      setViewIndex(0);
      setIsPreviewMode(false);
    } else {
      setCapturedImages(updatedImages);
      setViewIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleAddMore = () => {
    setIsPreviewMode(false);
  };

  const handleViewHistory = () => {
    if (capturedImages.length > 1) {
      const nextIndex =
        viewIndex === 0 ? capturedImages.length - 1 : viewIndex - 1;
      setViewIndex(nextIndex);
    }
  };

  return (
    <View style={styles.container}>
      {!isPreviewMode ? (
        <>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={styles.scanGuideContainer}>
            <View style={styles.scanGuide} />
          </View>

          <View style={styles.overlay}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={30} color="white" />
            </TouchableOpacity>

            <View style={styles.bottomBar}>
              <TouchableOpacity onPress={pickImage}>
                <MaterialCommunityIcons
                  name="image-multiple"
                  size={35}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.shutter} onPress={takePicture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <View style={{ width: 35 }}>
                {capturedImages.length > 0 && (
                  <TouchableOpacity onPress={() => setIsPreviewMode(true)}>
                    <AppText style={styles.countBadge}>
                      {capturedImages.length}
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </>
      ) : (
        /* PREVIEW MODE UI */
        <View style={styles.previewContainer}>
          <Image
            source={{
              uri: `data:image/jpg;base64,${capturedImages[viewIndex]}`,
            }}
            style={styles.fullPreview}
          />

          <View style={styles.previewOverlay}>
            <View style={styles.topActions}>
              <TouchableOpacity
                onPress={handleDeleteImage}
                style={styles.actionCircle}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsPreviewMode(false);
                  setCapturedImages([]);
                  setViewIndex(0);
                }}
                style={styles.actionCircle}
              >
                <MaterialCommunityIcons
                  name="restart"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={handleViewHistory}
              >
                <View style={styles.historyCircle}>
                  <AppText style={styles.historyText}>
                    {viewIndex + 1}/{capturedImages.length}
                  </AppText>
                </View>
                <AppText style={styles.buttonTextSmall}>History</AppText>
              </TouchableOpacity>

              {/* ADD MORE PHOTOS */}
              <TouchableOpacity
                style={styles.previewButton}
                onPress={handleAddMore}
              >
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={32}
                  color="white"
                />
                <AppText style={styles.buttonTextSmall}>Add More</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => onPhotoCaptured(capturedImages)}
              >
                <MaterialCommunityIcons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  scanGuideContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanGuide: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 1.2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 15,
    borderStyle: "dashed",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  previewContainer: { flex: 1, backgroundColor: "black" },
  fullPreview: { flex: 1, resizeMode: "contain" },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 20,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionCircle: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  closeButton: { alignSelf: "flex-end" },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  previewButton: { alignItems: "center", minWidth: 60 },
  historyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  historyText: { color: "white", fontSize: 10, fontWeight: "bold" },
  sendButton: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonTextSmall: { color: "white", fontSize: 11, marginTop: 4 },
  sendText: { color: "white", fontWeight: "bold", fontSize: 14 },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
  },
  countBadge: {
    color: "white",
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "bold",
  },
});

export default CameraLayout;
