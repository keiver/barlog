import * as React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import Red from "@/assets/images/plates/red.svg";
import Blue from "@/assets/images/plates/blue.svg";
import Yellow from "@/assets/images/plates/yellow.svg";
import Green from "@/assets/images/plates/green.svg";
import White from "@/assets/images/plates/white.svg";
import Gray from "@/assets/images/plates/gray.svg";
import Purple from "@/assets/images/plates/purple.svg";
import BarbelRight from "@/assets/images/barbell-right.svg";
import { ThemedText } from "./ThemedText";

interface BarbellProps {
  platesPerSide: Record<number, number>;
  barType?: string;
  weightUnit?: string;
  barWeight?: number;
}

interface Plate {
  weightKg: number;
  color: string;
  width: number; // Example width values in cm, please adjust as necessary
  label: string;
}

const plateWidths: Record<number, number> = {
  55: 30,
  45: 30,
  35: 30,
  25: 30,
  15: 30,
  10: 25,
  5: 16,
  2.5: 14,
};

const plateImages: Record<number, React.FC<React.SVGProps<SVGSVGElement>>> = {
  55: Red,
  45: Blue,
  35: Yellow,
  25: Green,
  15: White,
  10: Gray,
  5: Purple,
  2.5: Red,
};

const plates: Plate[] = Object.entries({
  55: "#d32f2f", // Red (25 kg / 55 lb)
  45: "#1976d2", // Blue (20 kg / 45 lb)
  35: "#fbc02d", // Yellow (15 kg / 35 lb)
  25: "#388e3c", // Green (10 kg / 25 lb)
  15: "#ffffff", // White (5 kg / 11 lb)
  10: "#a0a0a0", // Gray (2.5 kg / 5.5 lb)
  5: "#9b59b6", // Purple (commonly used for smaller plates in CrossFit)
  2.5: "#000000", // Black (1.25 kg / 2.75 lb)
}).map(([weight, color]) => {
  const weightKg = parseFloat(weight);
  const weightKgLabel = (parseFloat(weight) / 2.20462).toFixed(2);
  const weightLb = (parseFloat(weight) * 2.20462).toFixed(2);

  return {
    weightKg,
    color,
    width: plateWidths[weightKg],
    label: `${weightKgLabel} kg / ${weightLb} lb`,
  };
});

const Barbell: React.FC<BarbellProps> = ({
  platesPerSide,
  barType = "Standard",
  weightUnit = "lb",
  barWeight = 45,
}) => {
  const animatedValues = React.useRef(plates.map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    Animated.stagger(
      100,
      animatedValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    )?.start();
  }, [platesPerSide]);

  const renderPlates = (weight: number, index: number) => {
    const plate = plates.find((plate) => plate.weightKg === weight);
    if (!plate) return null;

    const numberOfPlates = platesPerSide[weight] || 0;
    return Array.from({ length: numberOfPlates }).map((_, plateIndex) => (
      <Animated.View
        key={`${weight}-${plateIndex}`}
        style={[
          styles.plate,
          { backgroundColor: plate.color, width: plate.width },
          { transform: [{ scale: animatedValues[index] }] },
        ]}
      >
        <ThemedText>{weight}</ThemedText>
      </Animated.View>
    ));
  };

  const renderSvgs = (weight: number, index: number) => {
    const numberOfPlates = platesPerSide[weight] || 0;
    const height = Dimensions.get("window").height;

    const plate = plates.find((plate) => plate.weightKg === weight);
    if (!plate) return null;

    return Array.from({ length: numberOfPlates }).map((_, plateIndex) => {
      const C = plateImages[weight];
      console.log("%ccomponents/Bar.tsx:121 plate", "color: #007acc;", plate);
      return (
        <C
          key={`${weight}-${plateIndex}`}
          width={plate.width}
          height={height}
          style={styles.plateImage}
        />
      );
    });
  };

  const totalWeight =
    plates.reduce((acc, plate) => {
      const numberOfPlates = platesPerSide[plate.weightKg] || 0;
      return acc + numberOfPlates * plate.weightKg * 2;
    }, 0) + barWeight;

  const sortedWeights = React.useMemo(
    () =>
      plates
        .map((plate) => plate.weightKg)
        .sort((a, b) => b - a)
        .reverse(),
    [platesPerSide]
  );

  return (
    <View
      style={styles.container}
      pointerEvents="none"
    >
      {/* <View style={styles.bar} /> */}
      <BarbelRight
        style={styles.barRight}
        width={500}
        height={150}
      />
      <View style={styles.platesContainer}>
        {sortedWeights.map((weight, index) => (
          <React.Fragment key={weight}>{renderSvgs(weight, index)}</React.Fragment>
        ))}
      </View>
      {/* <View style={styles.barShort} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
  },
  bar: {
    width: 70,
    height: 10,
    backgroundColor: "#34495e",
  },
  barShort: {
    width: 20,
    height: 15,
    backgroundColor: "#34495e",
    borderTopEndRadius: 3,
    borderBottomEndRadius: 3,
  },
  barRight: {
    position: "absolute",
    left: -190,
    top: Dimensions.get("window").height / 2 - 75,
  },
  platesContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    height: "100%",
    left: 86,
    width: Dimensions.get("window").width,
  },
  plate: {
    height: 100,
    marginHorizontal: 2,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    position: "absolute",
    bottom: -50,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#2c3e50", // Midnight Blue
  },
  plateImage: {
    marginHorizontal: -2.8,
    marginTop: -2.8,
    marginBottom: -2.8,
  },
});

export default Barbell;
