import * as React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
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
  weightUnit?: string;
  barWeight?: number;
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

const Barbell: React.FC<BarbellProps> = ({
  platesPerSide,
  barType = "Standard",
  weightUnit = "lb",
  barWeight = 45,
}) => {
  const weightsInPounds = Object.keys(plateImages).map((weight) => parseFloat(weight));

  const plates: Plate[] = weightsInPounds.map((w) => {
    const weightLb = w;
    const weightKg = parseFloat((w * 0.453592).toFixed(2));

    return {
      weightLb,
      weightKg,
      label: `${weightKg} kg / ${weightLb} lb`,
      image: plateImages[weightLb],
      height: 50, // Example height value in pixels
    };
  });

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

  const COLLAPSED_HEIGHT = -191;

  const renderPlates = (weight: number, index: number) => {
    const plate = plates.find((plate) => plate.weightLb === weight);
    if (!plate) return null;

    const numberOfPlates = platesPerSide[weight] || 0;

    return Array.from({ length: numberOfPlates }).map((_, plateIndex) => {
      const Component = plate.image;

      return (
        <Animated.View
          pointerEvents={"auto"}
          key={`${weight}-${plateIndex}`}
          style={[
            styles.plateContainer,
            {
              transform: [
                { scale: animatedValues[index] },
                { rotateX: `${45}deg` },
                // { rotateZ: `${75}deg` },
                // { rotateZ: `${75}deg` },
                { rotate: `${85}deg` },
                // {
                //   translateY: animatedValues[index].interpolate({
                //     inputRange: [0, 1],
                //     outputRange: [0, -1 * plateIndex],
                //   }),
                // },
              ],
              marginTop: weight < 25 ? -100 : -135,
              // marginTop: COLLAPSED_HEIGHT,
            },
          ]}
        >
          <Component pointerEvents={"auto"} />
        </Animated.View>
      );
    });
  };

  const sortedWeights = React.useMemo(
    () =>
      plates
        .map((plate) => plate.weightLb)
        .sort((a, b) => b - a)
        .reverse(),
    [platesPerSide]
  );

  return (
    <View
      style={styles.container}
      pointerEvents="none"
    >
      {sortedWeights.map((weight, index) => {
        return renderPlates(weight, index);
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative", // No longer absolute to ensure proper stacking vertically
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    paddingBottom: 35,
  },
  plateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Barbell;
