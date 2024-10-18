import React, { useEffect, useCallback } from "react";
import { StyleSheet, TextInput } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import Slider from "@/components/Slider";
import Barbell from "@/components/Bar";
import { ThemedRoundButton } from "@/components/SettingsIcon";
import usePlateset from "@/hooks/usePlateset";

import storage from "@/app/libs/localStorage";
import { RNVSliderRef } from "rn-vertical-slider";
import CustomModal from "@/components/Modal";
import { ThemedText } from "@/components/ThemedText";
import SettingsUnit from "@/components/SettingsUnit";
import Ionicons from "@expo/vector-icons/Ionicons";
import SettingsBarbellWeight from "@/components/SettingsBarbellWeight";

export type PlateSet = Record<number, number>;

const samplePlateSet: PlateSet = {
  45: 0,
  35: 0,
  25: 0,
  15: 0,
  10: 0,
  5: 0,
  2.5: 0,
};

const initialBarbellWeight = 45; // Barbell weight in pounds

export default function HomeScreen() {
  const { plates, loadPlates, unloadPlates } = usePlateset();
  const [lastCallTime, setLastCallTime] = React.useState<number | null>(null);
  const [barbellWeight, setBarbellWeight] = React.useState<number>(initialBarbellWeight);
  const [unit, setUnit] = React.useState<string>("kg");
  const sliderRef = React.useRef<RNVSliderRef>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

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

  React.useEffect(() => {
    // animate adding a new plate of 25 lbs
    loadPlates({ ...samplePlateSet, 25: 1 });

    // set slider value to 95
    sliderRef.current?.setValue?.(95);

    return () => {
      unloadPlates();
    };
  }, []);

  const calculatePlates = (targetWeight: number): PlateSet => {
    if (targetWeight < barbellWeight) {
      return { ...samplePlateSet };
    }

    // Subtract the barbell weight from the target weight to determine the total weight for plates
    let remainingWeight = (targetWeight - barbellWeight) / 2; // divide by 2 as we calculate for one side
    const availablePlates = [45, 35, 25, 15, 10, 5, 2.5];
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
    setModalVisible(true);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Slider
        onValueChanged={throttledGetScrollValue}
        animateCallback={clicked}
        unit={unit}
        barbellWeight={barbellWeight}
        ref={sliderRef}
      />
      <Barbell
        platesPerSide={plates}
        unit={unit}
        collapsed={modalVisible}
      />
      <ThemedRoundButton
        onPress={clicked}
        barbellWeight={barbellWeight}
        unit={unit}
      />
      <CustomModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Settings"
        buttonLabel="Save"
        onButtonPress={() => {
          setModalVisible(false);
        }}
      >
        <ThemedText type="label">Unit</ThemedText>
        <SettingsUnit />
        <ThemedText
          type="label"
          style={styles.barbellLabel}
        >
          Barbell Weight
        </ThemedText>

        {/* From the barbells listed, four common or close weights are:

45 lbs (20 kg) – Standard Barbell, Powerlifting Barbell, and Deadlift Bar
44 lbs (20 kg) – Olympic Barbell (20kg)
33 lbs (15 kg) – Olympic Barbell (15kg)
18 lbs (8 kg) – EZ Curl Bar
These weights are common across various barbell types or are close to one another in terms of weight for gym usage. */}

        <SettingsBarbellWeight
          onPress={(size) => {
            alert(size);
          }}
          sizes={[45, 44, 33, 18]}
        />
      </CustomModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 0,
  },
  bar: {
    position: "absolute",
  },
  barbellLabel: {
    marginTop: 20,
  },
});
