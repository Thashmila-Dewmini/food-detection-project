// frontend/src/screens/MealDetailScreen.js
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
import { Ionicons } from "@expo/vector-icons";
import MacroBox from "../components/MacroBox";
import CalorieGauge from "../components/CalorieGauge";
import { formatDateTime } from "../utils/dateUtils";


export default function MealDetailScreen({ navigation, route }) {
  const { meal } = route.params;

  const impactColor =
    CALORIE_IMPACT_COLORS[meal.calorie_impact] || COLORS.textMedium;
  const { date, time } = formatDateTime(meal.date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
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

        <Text style={styles.dateText}>{date} {time}</Text>

        {/* Meal image */}
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

        {/* Detected items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Text style={styles.itemCount}>
              {meal.detected_items?.length || 0} items
            </Text>
          </View>

          {meal.detected_items?.map((item, i) => (
            <View key={i} style={styles.foodRow}>
              <Text style={styles.foodName}>
                {item.item_name}
                {item.low_confidence_warning && (
                  <Text style={styles.warningInline}> ⚠️</Text>
                )}
              </Text>
              <Text style={styles.foodWeight}>
                {item.estimated_weight_g} g
              </Text>
            </View>
          ))}
        </View>

        {/* Nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition summary</Text>
          <View style={styles.macroRow}>
            <MacroBox label="Kcal"    value={meal.total_calories}          color={COLORS.macroKcal}    />
            <MacroBox label="protein" value={`${meal.total_protein_g}g`}   color={COLORS.macroProtein} />
            <MacroBox label="carbs"   value={`${meal.total_carbs_g}g`}     color={COLORS.macroCarbs}   />
            <MacroBox label="fat"     value={`${meal.total_fat_g}g`}       color={COLORS.macroFat}     />
          </View>
        </View>

        {/* Calorie impact gauge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Impact</Text>
          <CalorieGauge
            calories={meal.total_calories}
            impact={meal.calorie_impact}
          />
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
    marginBottom: 50,
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
    marginBottom: 15,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodName: {
    color: COLORS.textDark,
    fontSize: 14,
    flex: 1,
  },
  warningInline: {
    color: COLORS.calorieMedium,
  },
  foodWeight: {
    color: COLORS.textMedium,
    fontSize: 14,
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});