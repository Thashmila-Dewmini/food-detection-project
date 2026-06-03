// frontend/src/screens/HistoryScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMeals } from "../storage/mealStorage";
import { COLORS } from "../constants/theme";
import { CALORIE_IMPACT_COLORS } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "../utils/dateUtils";


// --------------------------------------------------------
// Shared screen header used in both empty and list states
// --------------------------------------------------------
function ScreenHeader({ navigation }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.title}>History List</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}


export default function HistoryScreen({ navigation }) {
  const [meals, setMeals] = useState([]);

  // --------------------------------------------------------
  // Reload meal list every time the screen comes into focus
  // --------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      getMeals().then(setMeals);
    }, []),
  );

  // --------------------------------------------------------
  // Empty state — shown when no meals have been saved yet
  // --------------------------------------------------------
  if (meals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader navigation={navigation} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No meals scanned yet. Tap Scan your meal to get started.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------
  // Meal list — rendered as a FlatList for performance
  // --------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader navigation={navigation} />

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const impactColor =
            CALORIE_IMPACT_COLORS[item.calorie_impact] || COLORS.textMedium;
          const { date, time } = formatDateTime(item.date);
          const foodNames =
            item.detected_items?.map((i) => i.item_name).join(", ") || "";

          return (
            <TouchableOpacity
              style={styles.mealCard}
              onPress={() =>
                navigation.navigate("MealDetail", { meal: item })
              }
            >
              {/* Meal thumbnail */}
              <View style={styles.thumbContainer}>
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.thumb}
                  />
                ) : (
                  <Text style={styles.thumbPlaceholder}>🖼️</Text>
                )}
              </View>

              {/* Meal info — date, food names, calories, impact */}
              <View style={styles.mealInfo}>
                <Text style={styles.mealDateTime}>
                  {date} {time}
                </Text>
                <Text style={styles.mealFoods} numberOfLines={1}>
                  {foodNames}
                </Text>
                <View style={styles.mealBottom}>
                  <Text style={styles.mealKcal}>
                    {item.total_calories} kcal
                  </Text>
                  <View
                    style={[
                      styles.impactTag,
                      { backgroundColor: impactColor },
                    ]}
                  >
                    <Text style={styles.impactTagText}>
                      {item.calorie_impact}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        }}
      />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  mealCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  thumbContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  thumb: {
    width: 60,
    height: 60,
  },
  thumbPlaceholder: {
    fontSize: 28,
  },
  mealInfo: {
    flex: 1,
  },
  mealDateTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  mealFoods: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  mealBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealKcal: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  impactTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  impactTagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textLight,
    marginLeft: 8,
  },
});