// frontend/src/screens/ImagePreviewScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";


const { width } = Dimensions.get("window");


export default function ImagePreviewScreen({ navigation, route }) {
  const { image } = route.params;

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
        <Text style={styles.title}>Your image</Text>
      </View>

      {/* Full-width image preview */}
      <Image
        source={{ uri: image.uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Action buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("ImageSource")}
        >
          <Text style={styles.outlineButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filledButton}
          onPress={() => navigation.navigate("Loading", { image })}
        >
          <Text style={styles.filledButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
    marginBottom: 70,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  image: {
    width: width - 40,
    height: width - 40,
    borderRadius: 12,
    backgroundColor: "#222",
    marginBottom: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonGroup: {
    gap: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  filledButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  filledButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
