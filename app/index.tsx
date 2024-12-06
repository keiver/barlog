import React, { useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RNVSliderRef } from "rn-vertical-slider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedView } from "@/components/ThemedView";
import Slider from "@/components/Slider";
import Barbell from "@/components/Bar";
import { ThemedRoundButton } from "@/components/SettingsIcon";
import usePlateset from "@/hooks/usePlateset";
import storage from "@/app/libs/localStorage";
import CustomModal from "@/components/Modal";
import { ThemedText } from "@/components/ThemedText";
import SettingsUnit from "@/components/SettingsUnit";
import SettingsBarbellWeight from "@/components/SettingsBarbellWeight";
import { keys } from "@/constants/Storage";
import { SlideCoachMark } from "@/components/SlideCoachMark";
import barbellWeights from "@/constants/barbells";

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

const initialBarbellWeight = 45; // Initial barbell weight in pounds

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
    load({ ...samplePlateSet, 25: 1 }, 95);
    return () => {
      unloadPlates();
    };
  }, []);

  const calculatePlates = React.useCallback(
    (targetWeight: number): PlateSet => {
      if (targetWeight < barbellWeight) {
        return { ...samplePlateSet };
      }

      const weightPerSide = (targetWeight - barbellWeight) / 2;
      const newPlates = { ...samplePlateSet };
      let remaining = weightPerSide;

      for (const plate of [45, 35, 25, 15, 10, 5, 2.5]) {
        const count = Math.floor(remaining / plate);
        if (count > 0) {
          newPlates[plate] = count;
          remaining -= plate * count;
          remaining = parseFloat(remaining.toFixed(2));
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

      const bbData = barbellWeights.find((b) => {
        return u === "kg" ? b.kg === barbellWeight : b.lbs === barbellWeight;
      });

      await client.storeData(keys.UNIT, u);
      await client.storeData(
        keys.BARBELL_WEIGHT,
        u === "kg" ? bbData?.kg.toString() || "" : bbData?.lbs.toString() || ""
      );
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
          title="Barlog"
          description="What plates per side do I need to reach a target weight on a barbell?"
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
            Barbell
          </ThemedText>
          <SettingsBarbellWeight
            onPress={(size) => {
              setBarbellWeight(size);
              client.storeData(keys.BARBELL_WEIGHT, size.toString());
            }}
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
    height: "100%",
    paddingTop: 0,
    backgroundColor: "#2C2C2E",
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
    marginTop: 10,
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
