import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { COLORS } from "../constants/theme";
import { CALORIE_IMPACT_COLORS } from "../constants/config";

export default function MealDetailScreen({ navigation, route }) {
  const { meal } = route.params;
  const impactColor =
    CALORIE_IMPACT_COLORS[meal.calorie_impact] || COLORS.textMedium;

  const dateObj = new Date(meal.date);
  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>

          <Text style={styles.title}>Meal History</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.dateText}>
          {dateStr} {timeStr}
        </Text>

        <View style={styles.imageContainer}>
          {meal.imageUri ? (
            <Image
              source={{ uri: meal.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
            </View>
          )}
        </View>

        {/* Nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition summary</Text>
          <View style={styles.macroRow}>
            <MacroBox
              label="Kcal"
              value={meal.total_calories}
              color="#FF9800"
            />
            <MacroBox
              label="protein"
              value={`${meal.total_protein_g}g`}
              color="#4CAF50"
            />
            <MacroBox
              label="carbs"
              value={`${meal.total_carbs_g}g`}
              color="#2196F3"
            />
            <MacroBox
              label="fat"
              value={`${meal.total_fat_g}g`}
              color="#E91E63"
            />
          </View>
        </View>

        {/* Calorie impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Impact</Text>
          <Text style={[styles.impactText, { color: impactColor }]}>
            {meal.calorie_impact}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroBox({ label, value, color }) {
  return (
    <View style={[styles.macroBox, { backgroundColor: color }]}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
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
  dateText: {
    textAlign: "center",
    color: COLORS.textMedium,
    fontSize: 13,
    marginBottom: 12,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
    backgroundColor: COLORS.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: {
    fontSize: 52,
  },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  macroValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  macroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  impactText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
