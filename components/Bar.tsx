import * as React from "react";
import { View, StyleSheet, Animated, LayoutAnimation, Dimensions, Platform, UIManager } from "react-native";

// Import your plate SVG components here
import Plate45 from "@/assets/images/plates/45.svg";
import Plate35 from "@/assets/images/plates/35.svg";
import Plate25 from "@/assets/images/plates/25.svg";
import Plate15 from "@/assets/images/plates/15.svg";
import Plate10 from "@/assets/images/plates/10.svg";
import Plate5 from "@/assets/images/plates/5.svg";
import Plate2P5 from "@/assets/images/plates/2_5.svg";

interface BarbellProps {
  platesPerSide: Record<number, number>;
  barType?: string;
  unit?: string;
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

const plateImages: Record<number, React.FC<React.SVGProps<SVGSVGElement>>> = {
  45: Plate45,
  35: Plate35,
  25: Plate25,
  15: Plate15,
  10: Plate10,
  5: Plate5,
  2.5: Plate2P5,
};

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Barbell: React.FC<BarbellProps> = ({
  platesPerSide,
  barType = "Standard",
  unit = "lb",
  barWeight = 45,
  collapsed = false,
}) => {
  const weightsInPounds = React.useMemo(() => Object.keys(plateImages).map((weight) => parseFloat(weight)), []);

  // Create the plates array with weight information and images
  const plates: Plate[] = React.useMemo(
    () =>
      weightsInPounds.map((w) => {
        const weightLb = w;
        const weightKg = parseFloat((w * 0.453592).toFixed(2));

        return {
          weightLb,
          weightKg,
          label: `${weightKg} kg / ${weightLb} lb`,
          image: plateImages[weightLb],
          height: 50, // Example height value in pixels
        };
      }),
    [weightsInPounds]
  );

  // Generate a flat list of all plates to render, including duplicates
  const platesToRender = React.useMemo(() => {
    let result: Plate[] = [];
    const sortedWeights = plates.map((plate) => plate.weightLb).sort((a, b) => b - a);

    sortedWeights.forEach((weight) => {
      const plate = plates.find((p) => p.weightLb === weight);
      if (plate) {
        const count = platesPerSide[weight] || 0;
        for (let i = 0; i < count; i++) {
          result.push(plate);
        }
      }
    });
    return result;
  }, [platesPerSide, plates]);

  // Initialize an animated value for each individual plate
  const animatedValues = React.useMemo(() => platesToRender.map(() => new Animated.Value(0)), [platesToRender]);

  // Animate each plate individually
  React.useEffect(() => {
    const animations = platesToRender.map((_, index) =>
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 25,
        useNativeDriver: true,
      })
    );
    Animated.sequence(animations).start();
  }, [animatedValues]);

  // Smoothly animate layout changes
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  }, [collapsed, platesToRender]);

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
                transform: [
                  { scale: animatedValues[index] },
                  { rotateX: `50deg` },
                  { rotateZ: `${unit === "lb" ? 245 : 0}deg` },
                ],
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
    bottom: Dimensions.get("window").height * 0.015,
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
