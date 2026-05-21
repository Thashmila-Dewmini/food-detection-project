import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { submitFeedback } from "../services/api";
import { saveMeal } from "../storage/mealStorage";
import { COLORS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";

// All 34 food classess for search
const FOOD_CLASSES = [
  "Basmathi Rice",
  "Bean Curry",
  "Beetroot Curry",
  "Bitter Gourd Curry",
  "Boiled Eggs",
  "Brinjal",
  "Capsicum Curry",
  "Cashew Nut Curry",
  "Cauliflower Curry",
  "Chicken",
  "Coconut Relish",
  "Cucumber",
  "Cutlet",
  "Dhal Curry",
  "Dried Halmasso",
  "Fish AmbulThiyal",
  "Fish Curry",
  "Fried Potato",
  "Fried Sprat",
  "Grilled Fish",
  "Lunu Miris",
  "Mallum",
  "Mango Curry",
  "Meat Curry",
  "Omelet",
  "Pappadam",
  "Pea Curry",
  "Polos Ambula",
  "Potato Milky Curry",
  "Pumpkin Curry",
  "Shrimp Curry",
  "Soya Curry",
  "Vegetable Salad",
  "White Rice",
];

export default function EditResultsScreen({ navigation, route }) {
  const { result, imageUri } = route.params;
  const [items, setItems] = useState(
    result.detected_items.map((i) => ({ ...i })),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      setSearchResults(
        FOOD_CLASSES.filter((f) =>
          f.toLowerCase().includes(text.toLowerCase()),
        ).slice(0, 6),
      );
    } else {
      setSearchResults([]);
    }
  };

  const addItem = (foodName) => {
    // add with default nutrition values
    setItems([
      ...items,
      {
        item_name: foodName,
        confidence_score: 100,
        estimated_weight_g: 100,
        calories: 100,
        protein_g: 3,
        carbs_g: 15,
        fat_g: 3,
        low_confidence_warning: false,
      },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const totalCalories = items.reduce((s, i) => s + i.calories, 0);
  const totalProtein = items.reduce((s, i) => s + i.protein_g, 0);
  const totalCarbs = items.reduce((s, i) => s + i.carbs_g, 0);
  const totalFat = items.reduce((s, i) => s + i.fat_g, 0);
  const impact =
    totalCalories < 400 ? "Low" : totalCalories <= 600 ? "Medium" : "High";

  const handleSave = async () => {
    try {
      await submitFeedback(Date.now().toString(), result.detected_items, items);
    } catch (_) {}

    await saveMeal({
      imageUri,
      detected_items: items,
      total_calories: Math.round(totalCalories * 10) / 10,
      total_protein_g: Math.round(totalProtein * 10) / 10,
      total_carbs_g: Math.round(totalCarbs * 10) / 10,
      total_fat_g: Math.round(totalFat * 10) / 10,
      calorie_impact: impact,
    });

    Alert.alert("Saved", "Your corrections have been saved.", [
      { text: "OK", onPress: () => navigation.navigate("Home") },
    ]);
  };

  const handleReset = () => {
    setItems(result.detected_items.map((i) => ({ ...i })));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Items</Text>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemCalories}>+ {item.calories} kcal -</Text>
              <TouchableOpacity onPress={() => removeItem(i)}>
                <Icon name="delete" size={15} color="#900" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Another Item</Text>
          </TouchableOpacity>
        </View>

        {/*search*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search & Add Items</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="search food items"
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Icon name="search" size={15} color="#000" />
          </View>
          {searchResults.map((food, i) => (
            <TouchableOpacity
              key={i}
              style={styles.searchResult}
              onPress={() => addItem(food)}
            >
              <Text style={styles.searchResultText}>{food}</Text>
              <Text style={styles.searchAddText}>+ Add</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/*updated nutrition summary*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updated Nutrition Summary</Text>
          <View style={styles.macroRow}>
            <MacroBox
              label="Kcal"
              value={Math.round(totalCalories)}
              color="#FF9800"
            />
            <MacroBox
              label="protein"
              value={`${Math.round(totalProtein)}g`}
              color="#4CAF50"
            />
            <MacroBox
              label="carbs"
              value={`${Math.round(totalCarbs)}g`}
              color="#2196F3"
            />
            <MacroBox
              label="fat"
              value={`${Math.round(totalFat)}g`}
              color="#E91E63"
            />
          </View>
        </View>

        {/*action buttons*/}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Reset to Original</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save correct results</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
  },
  itemCalories: {
    color: COLORS.textMedium,
    fontSize: 13,
    marginRight: 12,
  },
  addButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
    borderStyle: "dashed",
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
  },
  searchResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBlockColor: COLORS.border,
  },
  searchResultText: {
    color: COLORS.textDark,
    fontSize: 14,
  },
  searchAddText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
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
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  macroLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
  },
  resetButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
