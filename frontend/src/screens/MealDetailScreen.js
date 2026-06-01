// frontend/src/screens/MealDetailScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";
import { COLORS } from "../constants/theme";
import { CALORIE_IMPACT_COLORS } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";


const { width } = Dimensions.get("window");


// Calorie gauge constants
// Low: 0–400 kcal | Medium: 400–600 | High: 600+
// Max gauge value capped at 800 kcal
const GAUGE_MAX    = 800;
const GAUGE_SIZE   = width - 80;
const GAUGE_STROKE = 18;
const R  = GAUGE_SIZE / 2 - GAUGE_STROKE;
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
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}


// Half-circle calorie gauge
function CalorieGauge({ calories, impact }) {
  const clamped   = Math.min(calories, GAUGE_MAX);
  const fillAngle = (clamped / GAUGE_MAX) * 180;
  const needleTip = polarToCartesian(CX, CY, R - 10, fillAngle);
  const gaugeColor = CALORIE_IMPACT_COLORS[impact] || "#4CAF50";

  return (
    <View style={gaugeStyles.container}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + GAUGE_STROKE + 24}>

        {/* Background track */}
        <Path
          d={describeArc(CX, CY, R, 0, 180)}
          stroke="#E0E0E0"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/* Zone tints: Low / Medium / High */}
        <Path d={describeArc(CX, CY, R, 0,   90)}  stroke="#4CAF50" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />
        <Path d={describeArc(CX, CY, R, 90,  135)} stroke="#FF9800" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />
        <Path d={describeArc(CX, CY, R, 135, 180)} stroke="#F44336" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />

        {/* Filled arc up to current calorie level */}
        {fillAngle > 0 && (
          <Path
            d={describeArc(CX, CY, R, 0, fillAngle)}
            stroke={gaugeColor}
            strokeWidth={GAUGE_STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Needle and base circle */}
        <G>
          <Path
            d={`M ${CX} ${CY} L ${needleTip.x} ${needleTip.y}`}
            stroke={gaugeColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Circle cx={CX} cy={CY} r={8} fill={gaugeColor} />
          <Circle cx={CX} cy={CY} r={4} fill="#fff" />
        </G>

      </Svg>

      {/* Zone labels */}
      <View style={gaugeStyles.zoneRow}>
        <Text style={[gaugeStyles.zoneLabel, { color: "#4CAF50" }]}>Low</Text>
        <Text style={[gaugeStyles.zoneLabel, { color: "#FF9800" }]}>Medium</Text>
        <Text style={[gaugeStyles.zoneLabel, { color: "#F44336" }]}>High</Text>
      </View>

      <Text style={[gaugeStyles.calorieValue, { color: gaugeColor }]}>
        {calories} kcal
      </Text>
      <Text style={[gaugeStyles.impactLabel, { color: gaugeColor }]}>
        {impact} Calorie Impact
      </Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  zoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: GAUGE_SIZE,
    marginTop: -8,
    paddingHorizontal: 8,
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
});



// Macro summary box
function MacroBox({ label, value, color }) {
  return (
    <View style={[styles.macroBox, { backgroundColor: color }]}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}



// Format ISO date string -> { date, time }
function formatDateTime(isoString) {
  const d = new Date(isoString);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}


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
            <MacroBox label="Kcal"    value={meal.total_calories}          color="#FF9800" />
            <MacroBox label="protein" value={`${meal.total_protein_g}g`}   color="#4CAF50" />
            <MacroBox label="carbs"   value={`${meal.total_carbs_g}g`}     color="#2196F3" />
            <MacroBox label="fat"     value={`${meal.total_fat_g}g`}       color="#E91E63" />
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
    color: "#FF9800",
  },
  foodWeight: {
    color: COLORS.textMedium,
    fontSize: 14,
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