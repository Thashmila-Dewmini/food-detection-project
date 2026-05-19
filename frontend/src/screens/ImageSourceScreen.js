import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ImageSourceScreen({ navigation }) {
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      navigation.navigate("ImagePreview", { image: result.assets[0] });
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Gallery access is needed to upload photos.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      navigation.navigate("ImagePreview", { image: result.assets[0] });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Select Image Source</Text>
      </View>
      <Text style={styles.subtitle}>
        Choose how you want to add your food photo
      </Text>
      

      <View style={styles.optionsContainer}>
        {/* Camera card */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📸</Text>
          <Text style={styles.cardTitle}>Take a photo</Text>
          <Text style={styles.cardSub}>
            Use your camera to take a photo of your meal
          </Text>
          <TouchableOpacity style={styles.cardButton} onPress={openCamera}>
            <Text style={styles.cardButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
        {/* Gallery card */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🖼️</Text>
          <Text style={styles.cardTitle}>Choose from gallery</Text>
          <Text style={styles.cardSub}>
            Select an existing photo from your gallery
          </Text>
          <TouchableOpacity style={styles.cardButton} onPress={openGallery}>
            <Text style={styles.cardButtonText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textMedium,
    marginTop: 50,
    marginBottom: 70,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 25,
    marginLeft: 30,
    marginRight: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    marginBottom: 16,
  },
  cardButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
