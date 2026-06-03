// frontend/src/components/CalorieGauge.js
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";
import { CALORIE_IMPACT_COLORS } from "../constants/config";


const { width } = Dimensions.get("window");

// Gauge layout constants
// Low: 0–500 kcal (0–112.5°) | Medium: 500–700 (112.5–157.5°)
// High: 700+    (157.5–180°) | Max display capped at 800 kcal
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



// Half-circle calorie gauge with needle indicator
// Props:
//   calories — total meal calories (number)
//   impact   — "Low" | "Medium" | "High"
export default function CalorieGauge({ calories, impact }) {
  const clamped    = Math.min(calories, GAUGE_MAX);
  const fillAngle  = (clamped / GAUGE_MAX) * 180;
  const needleTip  = polarToCartesian(CX, CY, R - 10, fillAngle);
  const gaugeColor = CALORIE_IMPACT_COLORS[impact] || "#4CAF50";

  return (
    <View style={styles.container}>
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
        <Path d={describeArc(CX, CY, R, 0,   112.5)}  stroke="#4CAF50" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />
        <Path d={describeArc(CX, CY, R, 112.5, 157.5)} stroke="#FF9800" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />
        <Path d={describeArc(CX, CY, R, 157.5, 180)} stroke="#F44336" strokeWidth={GAUGE_STROKE} fill="none" strokeLinecap="butt" opacity={0.25} />

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
      <View style={styles.zoneRow}>
        <Text style={[styles.zoneLabel, { color: "#4CAF50" }]}>Low</Text>
        <Text style={[styles.zoneLabel, { color: "#FF9800" }]}>Medium</Text>
        <Text style={[styles.zoneLabel, { color: "#F44336" }]}>High</Text>
      </View>

      <Text style={[styles.calorieValue, { color: gaugeColor }]}>
        {calories} kcal
      </Text>
      <Text style={[styles.impactLabel, { color: gaugeColor }]}>
        {impact} Calorie Impact
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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