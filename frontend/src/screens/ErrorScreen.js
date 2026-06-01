// frontend/src/screens/ErrorScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { COLORS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";



// Shared header used across all error states
function ErrorHeader({ navigation, onBack, title }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}


export default function ErrorScreen({ navigation, route }) {
  const { type, imageUri } = route.params || {};

  // Image validation / blur error
  if (type === "image_invalid") {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorHeader
          onBack={() => navigation.navigate("Home")}
          title="We couldn't use this image"
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>
            Please check the issue below and try again with a better image
          </Text>

          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>⚠️ Image is too blurry</Text>
            <Text style={styles.errorBadgeSub}>
              Please capture a clear image
            </Text>
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips for a better image</Text>
            <Text style={styles.tip}>• Use good lighting</Text>
            <Text style={styles.tip}>• Keep your camera steady</Text>
            <Text style={styles.tip}>• Make sure the food is in focus</Text>
            <Text style={styles.tip}>• Capture from a top angle</Text>
          </View>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate("ImageSource")}
          >
            <Text style={styles.outlineButtonText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filledButton}
            onPress={() => navigation.navigate("ImageSource")}
          >
            <Text style={styles.filledButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Server or network error
  if (type === "server_error" || type === "network_error") {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorHeader
          onBack={() => navigation.goBack()}
          title="We couldn't analyze your image"
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.subtitle}>
            Our servers are having trouble right now. Please check your
            connection or try again.
          </Text>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>What can you do?</Text>
            <Text style={styles.tip}>• Check your internet connection</Text>
            <Text style={styles.tip}>• Try again in a few moments</Text>
            <Text style={styles.tip}>• Make sure the image is clear</Text>
          </View>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => {
              if (imageUri) {
                navigation.replace("Loading", { image: { uri: imageUri } });
              } else {
                navigation.navigate("ImageSource");
              }
            }}
          >
            <Text style={styles.outlineButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filledButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.filledButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // No food detected in image
  return (
    <SafeAreaView style={styles.container}>
      <ErrorHeader
        onBack={() => navigation.navigate("Home")}
        title="We couldn't find any food in this image"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tipsCard}>
          <Text style={styles.tip}>
            This may be due to poor lighting, an unclear angle, or the image
            not containing food. Please try again with a better photo.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("ImageSource")}
        >
          <Text style={styles.outlineButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filledButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.filledButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 12,
  },
  title: {
    fontSize: 20,
    paddingLeft: 10,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    lineHeight: 25,
    marginBottom: 25,
  },
  errorBadge: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorBadgeText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "600",
  },
  errorBadgeSub: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 15,
  },
  tip: {
    fontSize: 17,
    color: COLORS.textMedium,
    lineHeight: 35,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 25,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
  filledButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  filledButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});