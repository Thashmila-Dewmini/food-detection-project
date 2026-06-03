// frontend/src/screens/ResultsScreen.js
import React, { useState } from "react";
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
import Svg, { Path, G, Rect, Text as SvgText } from "react-native-svg";
import { saveMeal } from "../storage/mealStorage";
import { COLORS } from "../constants/theme";
import { CALORIE_IMPACT_COLORS } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";
import MacroBox from "../components/MacroBox";
import CalorieGauge from "../components/CalorieGauge";


const { width } = Dimensions.get("window");


// Thumbnail display dimensions
// screen width - horizontal margins (16×2) - card padding (16×2)
const THUMB_WIDTH  = width - 32 - 32;
const THUMB_HEIGHT = 200;

// --------------------------------------------------------
// Bounding box colors — one per detected item
// --------------------------------------------------------
const BOX_COLORS = [
  "#4CAF50", "#2196F3", "#FF9800", "#E91E63",
  "#9C27B0", "#00BCD4", "#FF5722", "#8BC34A",
];


// --------------------------------------------------------
// SVG overlay that draws bounding boxes on the thumbnail.
// The model returns bbox in original image pixel coordinates,
// so we scale them down to fit the thumbnail display size.
// --------------------------------------------------------
function BoundingBoxOverlay({ detectedItems, originalWidth, originalHeight }) {
  if (!detectedItems || detectedItems.length === 0) return null;

  const scaleX = THUMB_WIDTH  / (originalWidth  || THUMB_WIDTH);
  const scaleY = THUMB_HEIGHT / (originalHeight || THUMB_HEIGHT);

  return (
    <Svg
      width={THUMB_WIDTH}
      height={THUMB_HEIGHT}
      style={StyleSheet.absoluteFill}
    >
      {detectedItems.map((item, i) => {
        const bbox = item.bounding_box;
        if (!bbox) return null;

        const color   = BOX_COLORS[i % BOX_COLORS.length];
        const x       = bbox.x      * scaleX;
        const y       = bbox.y      * scaleY;
        const bWidth  = bbox.width  * scaleX;
        const bHeight = bbox.height * scaleY;

        const label  = `${item.item_name} ${item.confidence_score}%`;

        // Label pill dimensions — clamped to stay inside thumbnail
        const labelW = Math.min(label.length * 6.5 + 10, THUMB_WIDTH - x - 4);
        const labelH = 18;

        // Keep label inside thumbnail vertically
        const labelY = y > labelH + 2 ? y - labelH - 2 : y + bHeight + 2;

        return (
          <G key={i}>

            {/* Bounding box outline */}
            <Rect
              x={x}
              y={y}
              width={bWidth}
              height={bHeight}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
            />

            {/* Corner accents — top-left */}
            <Path
              d={`M ${x} ${y + 10} L ${x} ${y} L ${x + 10} ${y}`}
              stroke={color}
              strokeWidth={3}
              fill="none"
            />

            {/* Corner accents — top-right */}
            <Path
              d={`M ${x + bWidth - 10} ${y} L ${x + bWidth} ${y} L ${x + bWidth} ${y + 10}`}
              stroke={color}
              strokeWidth={3}
              fill="none"
            />

            {/* Corner accents — bottom-left */}
            <Path
              d={`M ${x} ${y + bHeight - 10} L ${x} ${y + bHeight} L ${x + 10} ${y + bHeight}`}
              stroke={color}
              strokeWidth={3}
              fill="none"
            />

            {/* Corner accents — bottom-right */}
            <Path
              d={`M ${x + bWidth - 10} ${y + bHeight} L ${x + bWidth} ${y + bHeight} L ${x + bWidth} ${y + bHeight - 10}`}
              stroke={color}
              strokeWidth={3}
              fill="none"
            />

            {/* Label background pill */}
            <Rect
              x={x}
              y={labelY}
              width={labelW}
              height={labelH}
              rx={4}
              ry={4}
              fill={color}
              opacity={0.9}
            />

            {/* Label text */}
            <SvgText
              x={x + 5}
              y={labelY + 13}
              fontSize={10}
              fontWeight="bold"
              fill="#ffffff"
            >
              {label}
            </SvgText>

          </G>
        );
      })}
    </Svg>
  );
}


export default function ResultsScreen({ navigation, route }) {
  const { result, imageUri } = route.params;

  // Original image dimensions for bounding box scaling
  const [imgDimensions, setImgDimensions] = useState({
    width:  640,
    height: 640,
  });

  // --------------------------------------------------------
  // Fetch original image dimensions on mount
  // Needed to scale bounding boxes to thumbnail size
  // --------------------------------------------------------
  React.useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (w, h) => setImgDimensions({ width: w, height: h }),
        (err)  => console.warn("Image.getSize failed:", err),
      );
    }
  }, [imageUri]);

  // --------------------------------------------------------
  // Save meal and return to Home when user confirms result
  // --------------------------------------------------------
  const handleCorrect = async () => {
    try {
      await saveMeal({
        imageUri,
        detected_items:  result.detected_items,
        total_calories:  result.total_calories,
        total_protein_g: result.total_protein_g,
        total_carbs_g:   result.total_carbs_g,
        total_fat_g:     result.total_fat_g,
        calorie_impact:  result.calorie_impact,
      });
    } catch (e) {
      console.error("Failed to save meal:", e);
    }

    navigation.navigate("Home");
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

        {/* Detected food items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detected food items</Text>
            <Text style={styles.itemCount}>
              {result.detected_items.length} items
            </Text>
          </View>

          {/* Image with bounding box SVG overlay */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <BoundingBoxOverlay
              detectedItems={result.detected_items}
              originalWidth={imgDimensions.width}
              originalHeight={imgDimensions.height}
            />
          </View>

          {/* Color legend — one dot per detected item */}
          <View style={styles.legendRow}>
            {result.detected_items.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: BOX_COLORS[i % BOX_COLORS.length] },
                  ]}
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {item.item_name}
                </Text>
              </View>
            ))}
          </View>

          {/* Food item list — name and estimated portion */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Item</Text>
            <Text style={styles.tableHeaderText}>Portion</Text>
          </View>

          {result.detected_items.map((item, i) => (
            <View key={i} style={styles.foodRow}>
              <View style={styles.foodNameRow}>
                <View
                  style={[
                    styles.foodDot,
                    { backgroundColor: BOX_COLORS[i % BOX_COLORS.length] },
                  ]}
                />
                <Text style={styles.foodName}>
                  {item.item_name}
                  {item.low_confidence_warning && (
                    <Text style={styles.warningInline}> ⚠️</Text>
                  )}
                </Text>
              </View>
              <View style={styles.portionBadge}>
                <Text style={styles.portionText}>
                  ~{item.estimated_weight_g}g
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Nutrition summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition summary</Text>
          <View style={styles.macroRow}>
            <MacroBox label="Kcal"    value={result.total_calories}          color={COLORS.macroKcal}    />
            <MacroBox label="protein" value={`${result.total_protein_g}g`}   color={COLORS.macroProtein} />
            <MacroBox label="carbs"   value={`${result.total_carbs_g}g`}     color={COLORS.macroCarbs}   />
            <MacroBox label="fat"     value={`${result.total_fat_g}g`}       color={COLORS.macroFat}     />
          </View>
        </View>

        {/* Calorie impact gauge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Impact</Text>
          <CalorieGauge
            calories={result.total_calories}
            impact={result.calorie_impact}
          />
        </View>

        {/* Confirmation buttons */}
        <Text style={styles.confirmQuestion}>Is this result correct?</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.notCorrectButton}
            onPress={() =>
              navigation.navigate("EditResults", { result, imageUri })
            }
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
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  thumbnailContainer: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    position: "relative",
    alignSelf: "center",
  },
  thumbnail: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textMedium,
    maxWidth: 90,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  foodNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  foodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  foodName: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  warningInline: {
    color: COLORS.calorieMedium,
  },
  portionBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  portionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
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