import * as React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

// Import your plate SVG components here
import Plate45 from "@/assets/images/plates/45.svg";
import Plate35 from "@/assets/images/plates/35.svg";
import Plate25 from "@/assets/images/plates/25.svg";
import Plate15 from "@/assets/images/plates/15.svg";
import Plate10 from "@/assets/images/plates/10.svg";
import Plate5 from "@/assets/images/plates/5.svg";
import Plate2P5 from "@/assets/images/plates/2_5.svg";

interface BarbellProps {
  platesPerSide: PlateSet;
  barType?: string;
  unit?: Unit;
  barWeight?: number;
  collapsed?: boolean;
}

interface Plate {
  weightKg: number;
  weightLb: number;
  label: string;
  height?: number;
  image: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Map of weights in pounds to their corresponding SVG components
const plateImages: Record<number, React.FC<React.SVGProps<SVGSVGElement>>> = {
  45: Plate45,
  35: Plate35,
  25: Plate25,
  15: Plate15,
  10: Plate10,
  5: Plate5,
  2.5: Plate2P5,
};

// Map of weights in kg to their corresponding weights in pounds
const kgToLbMap: Record<number, number> = {
  20.4: 45,
  15.9: 35,
  11.3: 25,
  6.8: 15,
  4.5: 10,
  2.3: 5,
  1.13: 2.5,
};

const Barbell: React.FC<BarbellProps> = ({ platesPerSide, unit = "lb", collapsed = false }) => {
  // Create the plates array with weight information and images
  const plates: Plate[] = React.useMemo(() => {
    const weightsInPounds = Object.keys(plateImages).map((weight) => parseFloat(weight));

    return weightsInPounds.map((w) => {
      const weightLb = w;
      const weightKg = parseFloat((w * 0.453592).toFixed(2));

      return {
        weightLb,
        weightKg,
        label: `${weightKg} kg / ${weightLb} lb`,
        image: plateImages[weightLb],
        height: 50,
      };
    });
  }, []);

  // Generate a flat list of all plates to render, including duplicates
  const platesToRender = React.useMemo(() => {
    const result: Plate[] = [];

    // Convert kg weights to lb if necessary
    const normalizedPlatesPerSide = { ...platesPerSide };
    if (unit === "kg") {
      const newPlatesPerSide: PlateSet = {};
      Object.entries(platesPerSide).forEach(([weight, count]) => {
        const weightNum = parseFloat(weight);
        const lbWeight = kgToLbMap[weightNum];
        if (lbWeight) {
          newPlatesPerSide[lbWeight] = count;
        }
      });
      Object.assign(normalizedPlatesPerSide, newPlatesPerSide);
    }

    // Sort plates by weight (heaviest first)
    const sortedWeights = plates.map((plate) => plate.weightLb).sort((a, b) => b - a);

    // Add plates to render list
    sortedWeights.forEach((weight) => {
      const plate = plates.find((p) => p.weightLb === weight);
      if (plate) {
        const count = normalizedPlatesPerSide[weight] || 0;
        for (let i = 0; i < count; i++) {
          result.push(plate);
        }
      }
    });

    return result;
  }, [platesPerSide, plates, unit]);

  const COLLAPSED_MARGIN = -191;
  const EXPANDED_MARGIN = -155;

  return (
    <View
      style={styles.container}
      pointerEvents="none"
    >
      {platesToRender.map((plate, index) => {
        const Component = plate.image;
        return (
          <Animated.View
            pointerEvents="auto"
            key={`plate-${index}`}
            style={[
              styles.plateContainer,
              {
                transform: [{ rotateX: "50deg" }, { rotateZ: "245deg" }],
                marginTop: collapsed ? COLLAPSED_MARGIN : EXPANDED_MARGIN,
              },
            ]}
          >
            <Component pointerEvents="auto" />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "column-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    bottom: 0,
  },
  plateContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default Barbell;
