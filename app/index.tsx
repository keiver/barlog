import React, { useEffect, useCallback } from "react";
import { Image, StyleSheet, Platform, SafeAreaView, useWindowDimensions, Dimensions } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Slider from "@/components/Slider";
import Barbell from "@/components/Bar";
import { ThemedRoundButton } from "@/components/SettingsIcon";
import BarbellImage from "@/assets/images/plates/red.svg";
import usePlateset from "@/hooks/usePlateset";

import storage from "@/app/libs/localStorage";

export type PlateSet = Record<number, number>;

const samplePlateSet: PlateSet = {
  45: 0,
  35: 0,
  25: 0,
  15: 0,
  10: 0,
  5: 0,
  2.5: 0,
  1.25: 0,
};

// const barbellWeight = 45; // Barbell weight in pounds

export default function HomeScreen() {
  const { plates, loadPlates, unloadPlates } = usePlateset();
  const [lastCallTime, setLastCallTime] = React.useState<number | null>(null);
  const [barbellWeight, setBarbellWeight] = React.useState<number>(0);
  const [unit, setUnit] = React.useState<string>("kg");

  const client = storage.getInstance();

  useEffect(() => {
    Promise.all([
      client.getData("barbellWeight").then((value) => {
        if (value) {
          setBarbellWeight(parseFloat(value));
        }
      }),
      client.getData("unit").then((value) => {
        if (value) {
          setUnit(value);
        }
      }),
    ]);
  }, []);

  const calculatePlates = (targetWeight: number): PlateSet => {
    if (targetWeight < barbellWeight) {
      return { ...samplePlateSet };
    }

    // Subtract the barbell weight from the target weight to determine the total weight for plates
    let remainingWeight = (targetWeight - barbellWeight) / 2; // divide by 2 as we calculate for one side
    const availablePlates = [45, 35, 25, 15, 10, 5, 2.5, 1.25];
    const newPlates: PlateSet = { ...samplePlateSet };

    for (let i = 0; i < availablePlates.length; i++) {
      const plate = availablePlates[i];
      const count = Math.floor(remainingWeight / plate);
      if (count > 0) {
        newPlates[plate] = count;
        remainingWeight -= plate * count;
        remainingWeight = parseFloat(remainingWeight.toFixed(2)); // Fix floating-point precision issues
      }
    }

    return newPlates;
  };

  const throttle = (func: (value: number) => void, limit: number) => {
    return (value: number) => {
      const now = Date.now();
      if (!lastCallTime || now - lastCallTime >= limit) {
        setLastCallTime(now);
        func(value);
      }
    };
  };

  const handleScrollValue = (value: number) => {
    const newPlates = calculatePlates(value);
    loadPlates(newPlates);
  };

  const throttledGetScrollValue = useCallback(throttle(handleScrollValue, 400), [lastCallTime]);

  const clicked = React.useCallback(() => {
    //
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Slider
        onValueChanged={throttledGetScrollValue}
        animateCallback={clicked}
        unit={unit}
        barbellWeight={barbellWeight}
      />
      <Barbell platesPerSide={plates} />
      {/* <ThemedRoundButton onPress={clicked} /> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 0,
  },
  bar: {
    position: "absolute",
  },
});
