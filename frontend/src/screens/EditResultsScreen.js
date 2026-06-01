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
    result.detected_items.map((i) => ({
      ...i,
    })),
  );
  const [summary, setSummary] = useState({
    total_calories: result.total_calories,
    total_protein_g: result.total_protein_g,
    total_carbs_g: result.total_carbs_g,
    total_fat_g: result.total_fat_g,
    calorie_impact: result.calorie_impact,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [portionInput, setPortionInput] = useState("");
  // const [showAddInput, setShowAddInput] = useState(false);
  const [customFood, setCustomFood] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const removeItem = async (index) => {
    const updated = items.filter((_, i) => i !== index);

    // update UI immediately (optimistic) then request server recalculation
    setItems(updated);
    try {
      await handleRecalculate(updated);
    } catch (_) {
      // if server recalc fails, keep optimistic UI but log handled earlier
    }
  };

  const handleRecalculate = async (updatedItems) => {
    try {
      const payload = updatedItems.map((item) => ({
        item_name: item.item_name,
        estimated_weight_g: item.estimated_weight_g,
      }));

      const response = await recalculateNutrition(payload);

      setItems(response.detected_items);

      setSummary({
        total_calories: response.total_calories,
        total_protein_g: response.total_protein_g,
        total_carbs_g: response.total_carbs_g,
        total_fat_g: response.total_fat_g,
        calorie_impact: response.calorie_impact,
      });
    } catch (error) {
      console.log("Failed to recalculate: ", error);
    }
  };

  const updatePortion = async (index, newWeight) => {
    const updated = [...items];
    updated[index].estimated_weight_g = newWeight;

    await handleRecalculate(updated);
    setEditingIndex(null);
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

  const addItem = async (foodName) => {
    // add with default nutrition values
    const updated = [
      ...items,
      {
        item_name: foodName,
        estimated_weight_g: 100,
      },
    ];

    // optimistic update so the new item shows immediately
    setItems(updated);
    try {
      await handleRecalculate(updated);
    } catch (_) {
      // recalc errors are logged in API helper
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSave = async () => {
    try {
      await submitFeedback(Date.now().toString(), result.detected_items, items);
    } catch (_) {}

    await saveMeal({
      imageUri,
      detected_items: items,
      total_calories: summary.total_calories,
      total_protein_g: summary.total_protein_g,
      total_carbs_g: summary.total_carbs_g,
      total_fat_g: summary.total_fat_g,
      calorie_impact: summary.calorie_impact,
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Items</Text>
          {items.map((item, i) => (
            <View key={i} style={styles.itemContainer}>
              {/* Top row */}
              <View style={styles.itemRow}>
                {/* food name */}
                <Text style={styles.itemName}>{item.item_name}</Text>

                {/* portion */}
                <Text style={styles.portionText}>
                  {item.estimated_weight_g} g
                </Text>

                {/* edit button */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditingIndex(i);
                    setPortionInput(String(item.estimated_weight_g));
                  }}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                {/* delete button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(i)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Edit input */}
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
              value={Math.round(summary.total_calories)}
              color="#FF9800"
            />
            <MacroBox
              label="protein"
              value={`${Math.round(summary.total_protein_g)}g`}
              color="#4CAF50"
            />
            <MacroBox
              label="carbs"
              value={`${Math.round(summary.total_carbs_g)}g`}
              color="#2196F3"
            />
            <MacroBox
              label="fat"
              value={`${Math.round(summary.total_fat_g)}g`}
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
  itemPortion: {
    color: COLORS.textMedium,
    fontSize: 13,
    marginRight: 12,
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
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  qtyText: {
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  customInputContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textDark,
  },

  customAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10,
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
