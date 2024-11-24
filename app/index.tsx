import React, { useEffect, useCallback } from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";

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
import SettingsBarbellWeight from "@/components/SettingsBarbellWeight";
import { keys } from "@/constants/Storage";
import { SlideCoachMark } from "@/components/SlideCoachMark";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors, tintColorLight } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";

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
  const [unit, setUnit] = React.useState<string>("lb");
  const sliderRef = React.useRef<RNVSliderRef>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [barbelCollapsed, setBarbelCollapsed] = React.useState(false);
  const [value, onValueChanged] = React.useState(0);
  const [userScrolledOver, setUserScrolledOver] = React.useState(false);

  const client = storage.getInstance();

  const load = useCallback(
    (p: PlateSet, slider: number) => {
      loadPlates(p);
      sliderRef.current?.setValue?.(slider);
    },
    [loadPlates, sliderRef?.current]
  );

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
    // setTimeout(() => {
    //   load({ ...samplePlateSet, 45: 2, 25: 1 }, 195);

    //   setTimeout(() => {
    //     load({ ...samplePlateSet, 45: 1 }, 150);

    //   }, 800);
    // }, 800);

    setTimeout(() => {
      load({ ...samplePlateSet, 25: 1 }, 95);
    }, 600);
    return () => {
      unloadPlates();
    };
  }, []);

  const calculatePlates = React.useCallback(
    (targetWeight: number): PlateSet => {
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
    },
    [barbellWeight]
  );

  const throttle = (func: (value: number) => void, limit: number) => {
    return (value: number) => {
      const now = Date.now();
      if (!lastCallTime || now - lastCallTime >= limit) {
        setLastCallTime(now);
        func(value);
      }
    };
  };

  const describePlateSet = React.useCallback(
    (plateSet: PlateSet) => {
      return Object.entries(plateSet)
        .filter(([_, count]) => count > 0)
        .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
        .map(([weight, count]) => {
          let displayWeight = parseFloat(weight);
          if (unit === "kg") {
            displayWeight = parseFloat((displayWeight * 0.453592).toFixed(1)); // Convert to kg
          }
          return `${displayWeight} × ${count}`;
        })
        .join(" · ");
    },
    [unit]
  );

  const handleScrollValue = React.useCallback(
    (v: number) => {
      const newPlates = calculatePlates(v);
      loadPlates(newPlates);
      onValueChanged(v);

      if (v > 250) {
        setUserScrolledOver(true);
        client.storeData(keys.SAW_COACH_MARK, "true");
      }
    },
    [barbelCollapsed, calculatePlates, loadPlates, value]
  );

  const throttledGetScrollValue = useCallback(throttle(handleScrollValue, 400), [lastCallTime]);

  const clicked = React.useCallback(() => {
    setModalVisible(true);
  }, []);

  const onUnitClicked = React.useCallback(
    async (u: string) => {
      setUnit(u);
      let newBarbellWeight = 0;

      if (u === "kg") {
        newBarbellWeight = 20;
      }

      if (u === "lb") {
        newBarbellWeight = 45;
      }

      await client.storeData(keys.UNIT, u);
      await client.storeData(keys.BARBELL_WEIGHT, newBarbellWeight.toString());
    },
    [setUnit, unit, barbellWeight]
  );

  const onLogClicked = React.useCallback(() => {
    return setBarbelCollapsed(() => !barbelCollapsed);
  }, [barbelCollapsed, setBarbelCollapsed]);

  const logs = React.useMemo(() => describePlateSet(plates), [plates, describePlateSet]);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <StatusBar style="light" />
      <ThemedView style={styles.container}>
        <Slider
          onValueChanged={(v) => {
            if (barbelCollapsed) {
              sliderRef.current?.setValue?.(value);
              return;
            }

            return throttledGetScrollValue(v);
          }}
          unit={unit}
          barbellWeight={barbellWeight}
          ref={sliderRef}
        />

        <ThemedRoundButton
          onPress={clicked}
          barbellWeight={barbellWeight}
          unit={unit}
          onLogClicked={onLogClicked}
          logs={logs}
          locked={barbelCollapsed}
          dimmed={modalVisible}
        />

        <Barbell
          platesPerSide={plates}
          unit={unit}
          collapsed={barbelCollapsed}
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
          <ThemedText
            type="label"
            style={styles.barbellLabel}
          >
            Unit
          </ThemedText>
          <SettingsUnit
            unit={unit}
            onPress={onUnitClicked}
          />
          <ThemedText
            type="label"
            style={styles.barbellLabel}
          >
            Barbell Weight
          </ThemedText>
          <SettingsBarbellWeight
            onPress={(size) => {
              setBarbellWeight(size);
              client.storeData(keys.BARBELL_WEIGHT, size.toString());
            }}
            sizes={[45, 44, 33, 18]}
            barbellWeight={barbellWeight}
            unit={unit}
          />
        </CustomModal>
        <SlideCoachMark hidden={userScrolledOver} />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    // android support to avoid white band in the bottom
    // paddingTop: Platform.OS === "android" ? 50 : 0,
    // paddingBottom: 0,
    height: "100%",
    // minHeight: Dimensions.get("window").height - 50,
    paddingTop: Platform.OS === "android" ? 50 : 0,
    backgroundColor: "#2C2C2E",
    //backgroundColor: "#FFB703",
  },
  input: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 0,
    position: "relative",
    // backgroundColor: "green",
    backgroundColor: "#2C2C2E",
  },
  bar: {
    position: "absolute",
  },
  barbellLabel: {
    marginTop: 20,
  },
  addIcon: {
    position: "absolute",
    bottom: 8,
    right: 0,
    color: "gray",
  },
  addIconContainer: {
    position: "absolute",
    height: 44,
    width: 44,
  },
});
