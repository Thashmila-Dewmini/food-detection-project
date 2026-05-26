import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
import { saveMeal } from "../storage/mealStorage";
import { COLORS } from "../constants/theme";
import { CALORIE_IMPACT_COLORS } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Half-circle gauge component
// Max calories on gauge = 800 kcal (above that = fully red)
// Low: 0-400, Medium: 400-600, High: 600+
const GAUGE_MAX = 800; 
const GAUGE_SIZE = width - 80;
const GAUGE_STROKE = 18;
const R = GAUGE_SIZE / 2 - GAUGE_STROKE;
const CX = GAUGE_SIZE / 2;
const CY = GAUGE_SIZE / 2;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function CalorieGauge({ calories, impact }) {
  const clamped = Math.min(calories, GAUGE_MAX);
  const fillAngle = (clamped / GAUGE_MAX) * 180;

  // needle tip position
  const needleAngle = fillAngle; // 0 = left, 180 = right
  const needleTip = polarToCartesian(CX, CY, R - 10, needleAngle);

  // track colour zones (Low 0-90, medium 90-135, high 135-180)
  const gaugeColor = CALORIE_IMPACT_COLORS[impact] || "#4CAF50";

  return (
    <View style={gaugeStyles.container}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + GAUGE_STROKE + 24}>
        {/*background track*/}
        <Path
          d={describeArc(CX, CY, R, 0, 180)}
          stroke="#E0E0E0"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/*Low zone: always green*/}
        <Path
          d={describeArc(CX, CY, R, 0, 90)}
          stroke="#4CAF50"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="butt"
          opacity={0.25}
        />

        {/*Medium zone: always orange*/}
        <Path
          d={describeArc(CX, CY, R, 90, 135)}
          stroke="#FF9800"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="butt"
          opacity={0.25}
        />

        {/*High zone: always red*/}
        <Path
          d={describeArc(CX, CY, R, 135, 180)}
          stroke="#F44336"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="butt"
          opacity={0.25}
        />

        {/*filled arc upto current calories*/}
        {fillAngle > 0 && (
          <Path
            d={describeArc(CX, CY, R, 0, fillAngle)}
            stroke={gaugeColor}
            strokeWidth={GAUGE_STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/*Needle*/}
        <G>
          <Path
            d={`M ${CX} ${CY} L ${needleTip.x} ${needleTip.y}`}
            stroke={gaugeColor}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/*Needle base circle*/}
          <Circle cx={CX} cy={CY} r={8} fill={gaugeColor} />
          <Circle cx={CX} cy={CY} r={4} fill="#fff" />
        </G>

        {/*zone labels*/}
        <Path d="" />
      </Svg>

      {/*zone labels below arc*/}
      <View style={gaugeStyles.zoneRow}>
        <Text style={[gaugeStyles.zoneLabel, { color: '#4CAF50'}]}>Low</Text>
        <Text style={[gaugeStyles.zoneLabel, { color: '#FF9800'}]}>Medium</Text>
        <Text style={[gaugeStyles.zoneLabel, { color: '#F44336'}]}>High</Text>
      </View>

      {/*calorie reading*/}
      <Text style={[gaugeStyles.calorieValue, { color: gaugeColor}]}>{calories} kcal</Text>
      <Text style={[gaugeStyles.impactLabel, { color: gaugeColor }]}>{impact} Calorie Impact</Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GAUGE_SIZE,
    marginTop: -8,
    paddingHorizontal: 8,
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default function ResultsScreen({ navigation, route }) {
  const { result, imageUri } = route.params;
  const impactColor =
    CALORIE_IMPACT_COLORS[result.calorie_impact] || COLORS.textMedium;

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
    navigation.navigate("Home");
  };

  const handleNotCorrect = () => {
    navigation.navigate("EditResults", { result, imageUri });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back" size={25} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Detected food items section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detected food items</Text>
            <Text style={styles.itemCount}>
              {result.detected_items.length} items
            </Text>
          </View>

          {/* Image thumbnail */}
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* Food items list */}
          {result.detected_items.map((item, i) => (
            <View key={i} style={styles.foodRow}>
              <Text style={styles.foodName}>
                {item.item_name}
                {item.low_confidence_warning && (
                  <Text style={styles.warningInline}> ⚠️</Text>
                )}
              </Text>
              <Text style={styles.foodCalories}>{item.estimated_weight_g} g</Text>
            </View>
          ))}
        </View>

        {/* Nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition summary</Text>
          <View style={styles.macroRow}>
            <MacroBox
              label="Kcal"
              value={result.total_calories}
              color="#FF9800"
            />
            <MacroBox
              label="protein"
              value={`${result.total_protein_g}g`}
              color="#4CAF50"
            />
            <MacroBox
              label="carbs"
              value={`${result.total_carbs_g}g`}
              color="#2196F3"
            />
            <MacroBox
              label="fat"
              value={`${result.total_fat_g}g`}
              color="#E91E63"
            />
          </View>
        </View>

        {/* Calorie impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Impact</Text>
          <CalorieGauge 
          calories={result.total_calories}
          impact={result.calorie_impact}/>
        </View>

        {/* Correct? */}
        <Text style={styles.confirmQuestion}>Is this result correct?</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.notCorrectButton}
            onPress={handleNotCorrect}
          >
            <Text style={styles.notCorrectText}>Not correct</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.correctButton}
            onPress={handleCorrect}
          >
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
    marginBottom: 12,
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
    marginBottom: 10,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  thumbnail: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#ddd",
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
    color: "#FF9800",
  },
  foodCalories: {
    color: COLORS.textMedium,
    fontSize: 14,
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  macroBox: {
    flex: 1,
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  macroValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  macroLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  impactText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  confirmQuestion: {
    textAlign: "center",
    color: COLORS.textMedium,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
  },
  notCorrectButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: "center",
  },
  notCorrectText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  correctButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: "center",
  },
  correctText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
