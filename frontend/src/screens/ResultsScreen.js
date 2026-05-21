import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Image, Dimensions,
} from 'react-native';
import { saveMeal } from '../storage/mealStorage';
import { COLORS } from '../constants/theme';
import { CALORIE_IMPACT_COLORS } from '../constants/config';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function ResultsScreen({ navigation, route }) {
  const { result, imageUri } = route.params;
  const impactColor = CALORIE_IMPACT_COLORS[result.calorie_impact] || COLORS.textMedium;

  const handleCorrect = async () => {
    await saveMeal({
      imageUri,
      detected_items: result.detected_items,
      total_calories: result.total_calories,
      total_protein_g: result.total_protein_g,
      total_carbs_g: result.total_carbs_g,
      total_fat_g: result.total_fat_g,
      calorie_impact: result.calorie_impact,
    });
    navigation.navigate('Home');
  };

  const handleNotCorrect = () => {
    navigation.navigate('EditResults', { result, imageUri });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Detected food items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detected food items</Text>
            <Text style={styles.itemCount}>{result.detected_items.length} items</Text>
          </View>

          {/* Image thumbnail */}
          <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

          {/* Food items list */}
          {result.detected_items.map((item, i) => (
            <View key={i} style={styles.foodRow}>
              <Text style={styles.foodName}>
                {item.item_name}
                {item.low_confidence_warning && (
                  <Text style={styles.warningInline}> ⚠️</Text>
                )}
              </Text>
              <Text style={styles.foodCalories}>{item.calories} kcal</Text>
            </View>
          ))}
        </View>

        {/* Nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition summary</Text>
          <View style={styles.macroRow}>
            <MacroBox label="Kcal" value={result.total_calories} color="#FF9800" />
            <MacroBox label="protein" value={`${result.total_protein_g}g`} color="#4CAF50" />
            <MacroBox label="carbs" value={`${result.total_carbs_g}g`} color="#2196F3" />
            <MacroBox label="fat" value={`${result.total_fat_g}g`} color="#E91E63" />
          </View>
        </View>

        {/* Calorie impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Impact</Text>
          <Text style={[styles.impactText, { color: impactColor }]}>
            {result.calorie_impact}
          </Text>
        </View>

        {/* Correct? */}
        <Text style={styles.confirmQuestion}>Is this result correct?</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.notCorrectButton} onPress={handleNotCorrect}>
            <Text style={styles.notCorrectText}>Not correct</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.correctButton} onPress={handleCorrect}>
            <Text style={styles.correctText}>Correct</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 12,
    marginBottom: 15,
  },
  backArrow: { 
    fontSize: 22, 
    color: COLORS.textDark, 
    fontWeight: '300' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
  },
  section: {
    backgroundColor: COLORS.card, 
    marginHorizontal: 16, 
    marginBottom: 12,
    borderRadius: 16, 
    padding: 16,
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 1,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 15, 
    marginBottom: 10,
    fontWeight: 'bold', 
    color: COLORS.textDark 
  },
  itemCount: { 
    fontSize: 13, 
    color: COLORS.textMedium 
  },
  thumbnail: {
    width: '100%', 
    height: 160, 
    borderRadius: 10, 
    marginBottom: 12, 
    backgroundColor: '#ddd',
  },
  foodRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingVertical: 6, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border,
  },
  foodName: { 
    color: COLORS.textDark, 
    fontSize: 14, 
    flex: 1 
  },
  warningInline: { 
    color: '#FF9800' 
  },
  foodCalories: { 
    color: COLORS.textMedium, 
    fontSize: 14 
  },
  macroRow: { 
    flexDirection: 'row', 
    gap: 10, 
    justifyContent: 'space-between' 
  },
  macroBox: {
    flex: 1, 
    marginTop: 10,
    borderRadius: 12, 
    padding: 10, 
    alignItems: 'center',
  },
  macroValue: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  macroLabel: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 11, 
    marginTop: 2 
  },
  impactText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 4 
  },
  confirmQuestion: {
    textAlign: 'center', 
    color: COLORS.textMedium,
    fontSize: 14, 
    marginTop: 20,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row', 
    gap: 12, 
    marginHorizontal: 16,
  },
  notCorrectButton: {
    flex: 1, 
    borderWidth: 2, 
    borderColor: COLORS.primary,
    borderRadius: 30, 
    paddingVertical: 13, 
    alignItems: 'center',
  },
  notCorrectText: { 
    color: COLORS.primary, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  correctButton: {
    flex: 1, 
    backgroundColor: COLORS.primary,
    borderRadius: 30, 
    paddingVertical: 13, 
    alignItems: 'center',
  },
  correctText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});