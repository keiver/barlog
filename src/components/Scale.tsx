import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";

type Unit = "lb" | "kg";

interface VerticalRulerProps {
  unit?: Unit;
  dimmed?: boolean;
}

const VerticalRuler: React.FC<VerticalRulerProps> = ({ unit = "lb", dimmed = false }) => {
  // Get device height
  const windowHeight = Dimensions.get("window").height;

  // Define max value based on unit
  const maxValue = unit === "lb" ? 800 : 363; // 800 lb ≈ 363 kg

  // Calculate scale factor to map max value to screen height
  const scaleFactor = windowHeight / maxValue;

  // Generate marks at appropriate intervals based on unit
  const interval = unit === "lb" ? 50 : 20;
  const marks = Array.from({ length: Math.floor(maxValue / interval) + 1 }, (_, i) => i * interval);

  // Generate smaller marks with proper length calculation
  const smallInterval = unit === "lb" ? 10 : 5;
  const smallMarksLength = Math.floor(maxValue / smallInterval) + 1;

  return (
    <View
      pointerEvents="none"
      style={[styles.container, dimmed && styles.dimmed]}
    >
      {marks.map((value) => (
        <View
          key={value}
          style={[
            styles.markContainer,
            {
              bottom: value * scaleFactor - 10,
            },
          ]}
        >
          <View style={styles.mark} />
          <Text style={styles.markText}>{`${value}`}</Text>
        </View>
      ))}

      {/* Generate smaller marks */}
      {Array.from({ length: smallMarksLength }, (_, i) => i * smallInterval).map((value) => {
        // Skip if this position already has a major mark
        if (value % interval === 0) return null;

        return (
          <View
            key={value}
            style={[
              styles.smallMarkContainer,
              {
                bottom: value * scaleFactor - 10,
              },
            ]}
          >
            <View style={styles.smallMark} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderRightWidth: 1,
    borderRightColor: "transparent",
    zIndex: 32,
    elevation: 32,
  },
  markContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    left: 0,
    height: 20,
  },
  mark: {
    width: 10,
    height: 2,
    backgroundColor: "#c0392b",
  },
  markText: {
    marginLeft: 4,
    fontSize: 8,
    color: "#c0392b",
  },
  smallMarkContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    left: 0,
    height: 20,
  },
  smallMark: {
    width: 5,
    height: 1,
    backgroundColor: "#c0392b",
  },
  dimmed: {
    opacity: 0,
  },
});

export default VerticalRuler;
