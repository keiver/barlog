import React, { useEffect, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RNVSliderRef } from "rn-vertical-slider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { nativeWatchEventEmitter } from "react-native-watch-connectivity/dist/native-module";
import { sendMessage, getIsWatchAppInstalled, getReachability } from "react-native-watch-connectivity";

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
import { WATCH_NUMBER_EVENT } from "../WatchModule";
import { calculatePlates, describePlateSet, convert, findMatchingById } from "./libs/helpers";

const initialPlateSet = {
  45: 0,
  35: 0,
  25: 0,
  15: 0,
  10: 0,
  5: 0,
  2.5: 0,
};

const initialBarbellId = "1"; // 20kg/45lb Olympic bar

export default function HomeScreen() {
  const { plates, loadPlates } = usePlateset();
  const [lastCallTime, setLastCallTime] = React.useState<number | null>(null);
  const [barbellId, setBarbellId] = React.useState<string>(initialBarbellId);
  const [unit, setUnit] = React.useState<Unit>("lb");
  const sliderRef = React.useRef<RNVSliderRef>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [barbellCollapsed, setBarbellCollapsed] = React.useState(false);
  const [weight, setWeight] = React.useState(0);
  const [userScrolledOver, setUserScrolledOver] = React.useState(false);

  const client = storage.getInstance();

  const barbellData = useMemo(() => findMatchingById(barbellId), [barbellId]);

  const load = useCallback(
    (plateSet: typeof initialPlateSet, targetWeight: number) => {
      loadPlates(plateSet);
      sliderRef.current?.setValue?.(targetWeight);
      setWeight(targetWeight);
    },
    [loadPlates]
  );

  const reset = useCallback(() => {
    load({ ...initialPlateSet, 25: 1 }, 95);
  }, [load]);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    Promise.all([
      client.getData(keys.BARBELL_ID).then((value) => {
        if (value) setBarbellId(value);
      }),
      client.getData(keys.UNIT).then((value) => {
        if (value) setUnit(value as Unit);
      }),
    ]);
  }, []);

  const throttle = useCallback(
    (func: (value: number) => void, limit: number) => {
      return (value: number) => {
        const now = Date.now();
        if (!lastCallTime || now - lastCallTime >= limit) {
          setLastCallTime(now);
          func(value);
        }
      };
    },
    [lastCallTime]
  );

  const handleScrollValue = useCallback(
    (value: number) => {
      if (!barbellData) return;

      const newPlates = calculatePlates(value, unit === "kg" ? barbellData?.kg : barbellData?.lbs, unit);

      loadPlates(newPlates);
      setWeight(value);

      if (value > 250) {
        setUserScrolledOver(true);
        client.storeData(keys.SAW_COACH_MARK, "true");
      }
    },
    [barbellId, unit, loadPlates, barbellData]
  );

  const throttledGetScrollValue = useCallback(throttle(handleScrollValue, 100), [handleScrollValue, throttle]);

  const onUnitChanged = useCallback(
    async (newUnit: Unit) => {
      try {
        setUnit(newUnit);
        reset();
        await client.storeData(keys.UNIT, newUnit);
      } catch (error) {
        console.error("Error setting unit:", error);
      }
    },
    [reset, setUnit]
  );

  // Watch connectivity
  useEffect(() => {
    const subscription = nativeWatchEventEmitter.addListener(WATCH_NUMBER_EVENT, (event) => {
      if (event.number === undefined || barbellCollapsed || event.number < barbellId) {
        return;
      }

      throttledGetScrollValue(event.number);
      sliderRef.current?.setValue?.(event.number);
    });

    return () => subscription.remove();
  }, [barbellCollapsed, throttledGetScrollValue]);

  const plateDescription = React.useMemo(() => describePlateSet(plates, unit), [plates, unit]);

  const checkWatchConnectivityAndSend = useCallback(async () => {
    try {
      const [installed, reachable] = await Promise.all([getIsWatchAppInstalled(), getReachability()]);

      if (!installed || !reachable) return;

      const message = {
        logs: plateDescription,
        weight,
        label: `${convert(weight, unit)} ${unit}`,
        unit,
      };

      sendMessage(
        message,
        (response) => console.log("Watch response:", response),
        (error) => console.error("Watch error:", error)
      );
    } catch (error) {
      console.error("Watch connectivity error:", error);
    }
  }, [plateDescription, weight, unit]);

  useEffect(() => {
    checkWatchConnectivityAndSend();
  }, [plateDescription, weight, barbellId, unit, checkWatchConnectivityAndSend]);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <StatusBar style="light" />
      <ThemedView style={styles.container}>
        <Slider
          onValueChanged={(value) => {
            if (barbellCollapsed) {
              sliderRef.current?.setValue?.(weight);
              return;
            }
            return throttledGetScrollValue(value);
          }}
          unit={unit}
          sliderValue={weight}
          ref={sliderRef}
        />

        <ThemedRoundButton
          onPress={() => setModalVisible(true)}
          barbellId={barbellId}
          unit={unit}
          onLogClicked={() => setBarbellCollapsed((prev) => !prev)}
          logs={plateDescription}
          locked={barbellCollapsed}
          dimmed={modalVisible}
        />

        <Barbell
          platesPerSide={plates}
          unit={unit}
          collapsed={barbellCollapsed}
        />

        <CustomModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Barlog"
          description="What plates per side do I need to reach a target weight on a barbell?"
          buttonLabel="Save"
          onButtonPress={() => setModalVisible(false)}
        >
          <ThemedText
            type="label"
            style={styles.barbellLabel}
          >
            Unit
          </ThemedText>
          <SettingsUnit
            unit={unit}
            onPress={onUnitChanged}
          />
          <ThemedText
            type="label"
            style={styles.barbellLabel}
          >
            Barbell
          </ThemedText>
          <SettingsBarbellWeight
            onPress={setBarbellId}
            barbellId={barbellId}
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
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 0,
    position: "relative",
    backgroundColor: "#2C2C2E",
  },
  barbellLabel: {
    marginTop: 10,
  },
});
