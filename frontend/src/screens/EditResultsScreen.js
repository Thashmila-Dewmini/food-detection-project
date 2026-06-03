// frontend/src/screens/EditResultsScreen.js
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
import { submitFeedback, recalculateNutrition } from "../services/api";
import { saveMeal } from "../storage/mealStorage";
import { COLORS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import MacroBox from "../components/MacroBox";


// --------------------------------------------------------
// All 34 supported food classes for the search & add panel.
// Must stay in sync with the backend YOLO model classes.
// --------------------------------------------------------
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

  const [summary, setSummary] = useState({
    total_calories:  result.total_calories,
    total_protein_g: result.total_protein_g,
    total_carbs_g:   result.total_carbs_g,
    total_fat_g:     result.total_fat_g,
    calorie_impact:  result.calorie_impact,
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [portionInput, setPortionInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  // --------------------------------------------------------
  // Remove an item and immediately recalculate totals.
  // UI updates optimistically — server confirms in background.
  // --------------------------------------------------------
  const removeItem = async (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);

    try {
      await handleRecalculate(updated);
    } catch (_) {
      // Recalc errors are logged inside handleRecalculate
    }
  };


  // --------------------------------------------------------
  // Send updated item list to backend and refresh summary.
  // Called after any add, remove, or portion change.
  // --------------------------------------------------------
  const handleRecalculate = async (updatedItems) => {
    try {
      const payload = updatedItems.map((item) => ({
        item_name:          item.item_name,
        estimated_weight_g: item.estimated_weight_g,
      }));

      const response = await recalculateNutrition(payload);

      setItems(response.detected_items);

      setSummary({
        total_calories:  response.total_calories,
        total_protein_g: response.total_protein_g,
        total_carbs_g:   response.total_carbs_g,
        total_fat_g:     response.total_fat_g,
        calorie_impact:  response.calorie_impact,
      });

    } catch (error) {
      console.error("Failed to recalculate nutrition:", error);
    }
  };


  // --------------------------------------------------------
  // Update a single item's portion weight and recalculate.
  // --------------------------------------------------------
  const updatePortion = async (index, newWeight) => {
    const updated = [...items];
    updated[index].estimated_weight_g = newWeight;

    await handleRecalculate(updated);
    setEditingIndex(null);
  };


  // --------------------------------------------------------
  // Filter FOOD_CLASSES by search text (max 6 results).
  // --------------------------------------------------------
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


  // --------------------------------------------------------
  // Add a new food item at default 100g and recalculate.
  // UI updates optimistically before server responds.
  // --------------------------------------------------------
  const addItem = async (foodName) => {
    const updated = [
      ...items,
      {
        item_name:          foodName,
        estimated_weight_g: 100,
      },
    ];

    setItems(updated);

    try {
      await handleRecalculate(updated);
    } catch (_) {
      // Recalc errors are logged inside handleRecalculate
    }

    setSearchQuery("");
    setSearchResults([]);
  };


  // --------------------------------------------------------
  // Submit feedback, save meal, and navigate to Home.
  // Feedback failure is non-blocking — meal is saved regardless.
  // --------------------------------------------------------
  const handleSave = async () => {
    try {
      await submitFeedback(
        Date.now().toString(),
        result.detected_items,
        items,
      );
    } catch (_) {
      // Feedback errors are non-fatal; continue to save meal
    }

    try {
      await saveMeal({
        imageUri,
        detected_items:  items,
        total_calories:  summary.total_calories,
        total_protein_g: summary.total_protein_g,
        total_carbs_g:   summary.total_carbs_g,
        total_fat_g:     summary.total_fat_g,
        calorie_impact:  summary.calorie_impact,
      });
    } catch (e) {
      console.error("Failed to save meal:", e);
    }

    Alert.alert("Saved", "Your corrections have been saved.", [
      { text: "OK", onPress: () => navigation.navigate("Home") },
    ]);
  };


  // --------------------------------------------------------
  // Reset all items and summary back to original model output.
  // Also clears any open portion editor.
  // --------------------------------------------------------
  const handleReset = () => {
    setItems(result.detected_items.map((i) => ({ ...i })));

    setSummary({
      total_calories:  result.total_calories,
      total_protein_g: result.total_protein_g,
      total_carbs_g:   result.total_carbs_g,
      total_fat_g:     result.total_fat_g,
      calorie_impact:  result.calorie_impact,
    });

    setEditingIndex(null);
    setPortionInput("");
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Results</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Detected items list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Items</Text>

          {items.map((item, i) => (
            <View key={i} style={styles.itemContainer}>

              {/* Item row — name, portion, edit and delete */}
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.item_name}</Text>

                <Text style={styles.portionText}>
                  {item.estimated_weight_g} g
                </Text>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditingIndex(i);
                    setPortionInput(String(item.estimated_weight_g));
                  }}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(i)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Inline portion editor — shown only for active row */}
              {editingIndex === i && (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.portionInput}
                    keyboardType="numeric"
                    value={portionInput}
                    onChangeText={setPortionInput}
                    placeholder="Enter grams"
                  />
                  <TouchableOpacity
                    style={styles.savePortionButton}
                    onPress={() => {
                      const grams = parseFloat(portionInput);
                      if (!isNaN(grams) && grams > 0) {
                        updatePortion(i, grams);
                        setEditingIndex(null);
                      }
                    }}
                  >
                    <Text style={styles.savePortionText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          ))}
        </View>

        {/* Search and add food items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search & Add Items</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search food items"
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Ionicons name="search" size={15} color={COLORS.textDark} />
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

        {/* Updated nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updated Nutrition Summary</Text>
          <View style={styles.macroRow}>
            <MacroBox label="Kcal"    value={Math.round(summary.total_calories)}          color={COLORS.macroKcal}    />
            <MacroBox label="protein" value={`${Math.round(summary.total_protein_g)}g`}   color={COLORS.macroProtein} />
            <MacroBox label="carbs"   value={`${Math.round(summary.total_carbs_g)}g`}     color={COLORS.macroCarbs}   />
            <MacroBox label="fat"     value={`${Math.round(summary.total_fat_g)}g`}       color={COLORS.macroFat}     />
          </View>
        </View>

        {/* Action buttons */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 20,
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
    marginBottom: 15,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  portionText: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  editText: {
    color: "#1976D2",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "600",
  },
  editRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  portionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textDark,
  },
  savePortionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10,
  },
  savePortionText: {
    color: "#fff",
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
    borderBottomColor: COLORS.border,
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
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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