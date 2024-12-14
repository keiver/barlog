import React, { useEffect, useCallback, useMemo } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { RNVSliderRef } from "rn-vertical-slider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

import { useWatch } from "./src/hooks/useWatch";

import { ThemedView } from "@/src/components/ThemedView";
import Slider from "@/src/components/Slider";
import Barbell from "@/src/components/Bar";
import { ThemedRoundButton } from "@/src/components/SettingsIcon";
import usePlateset from "@/src/hooks/usePlateset";
import storage from "@/src/libs/localStorage";
import CustomModal from "@/src/components/Modal";
import { ThemedText } from "@/src/components/ThemedText";
import SettingsUnit from "@/src/components/SettingsUnit";
import SettingsBarbellWeight from "@/src/components/SettingsBarbellWeight";
import { keys } from "@/src/constants/Storage";
import { SlideCoachMark } from "@/src/components/SlideCoachMark";

import { calculatePlates, convert, describePlateSet, findMatchingById } from "@/src/libs/helpers";
import VerticalRuler from "@/src/components/Scale";
import LogManager from "@/src/libs/LogManager";
import WeightLogList from "@/src/components/WeightLogList";

const initialPlateSet: PlateSet = {
  "45": 0,
  "35": 0,
  "25": 0,
  "15": 0,
  "10": 0,
  "5": 0,
  "2.5": 0,
};

const initialBarbellId = "1"; // 20kg/45lb Olympic bar

export default function RootLayout() {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  const colorScheme = useColorScheme();
  const [lastCallTime, setLastCallTime] = React.useState<number | null>(null);
  const [barbellId, setBarbellId] = React.useState<string>(initialBarbellId);
  const [unit, setUnit] = React.useState<Unit>("lb");
  const { plates, loadPlates } = usePlateset();
  const sliderRef = React.useRef<RNVSliderRef>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [barbellCollapsed, setBarbellCollapsed] = React.useState(false);
  const [weight, setWeight] = React.useState(0);
  const [userScrolledOver, setUserScrolledOver] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [logId, setLogId] = React.useState<string | null>(null);
  const [barKey, setBarKey] = React.useState(0);
  const [logVisible, setLogVisible] = React.useState(false);

  const client = storage.getInstance();
  const barbellData = useMemo(() => findMatchingById(barbellId), [barbellId]);
  const logManager = LogManager.getInstance();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [storedBarbellId, storedUnit] = await Promise.all([
          client.getData(keys.BARBELL_ID),
          client.getData(keys.UNIT),
        ]);

        if (storedBarbellId) setBarbellId(storedBarbellId);
        if (storedUnit) setUnit(storedUnit as Unit);

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
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
    [barbellId, unit, loadPlates, barbellData, logManager]
  );

  const throttledGetScrollValue = useCallback(throttle(handleScrollValue, 100), [handleScrollValue, throttle]);

  const plateDescription = React.useMemo(() => describePlateSet(plates, unit), [plates, unit, logId]);

  const onValueChanged = useCallback(
    (value: number) => {
      return throttledGetScrollValue(value);
    },
    [throttledGetScrollValue, weight, barbellCollapsed, sliderRef]
  );

  const reset = useCallback(() => {
    handleScrollValue(95);
    sliderRef.current?.setValue?.(95);
    setBarbellCollapsed(false);
  }, [handleScrollValue, setBarbellCollapsed]);

  useEffect(() => {
    reset();
  }, [isLoading]);

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
    [reset, setUnit, isLoading]
  );

  const onLogClicked = useCallback(() => {
    setBarbellCollapsed((prev) => {
      if (prev) {
        logManager.addLog({
          weight,
          unit,
          barbellId,
          plateDescription: plateDescription,
        });
      }

      return !prev;
    });
  }, [weight, unit, barbellId, logManager, plateDescription, setBarbellCollapsed]);

  const onItemTapped = useCallback(
    (log: WeightLog) => {
      const targetWeight = parseInt(`${log.unit === "kg" ? log.weight.toFixed(0) : log.weight}`, 10);

      handleScrollValue(targetWeight);
      sliderRef.current?.setValue?.(targetWeight);
      setBarbellCollapsed(false);
      setUnit(log.unit as Unit);
      setBarbellId(log.barbellId);
      setLogVisible(false);
      setLogId(`${log.timestamp}`);
    },
    [unit, handleScrollValue, sliderRef, setBarbellCollapsed, setUnit, setBarbellId, setLogVisible, setLogId]
  );

  const onSettingsClose = useCallback(() => {
    setModalVisible(false);
    handleScrollValue(weight);
    sliderRef.current?.setValue?.(weight);
    setBarbellCollapsed(false);
    setBarKey((prev) => prev + 1);
  }, [setBarKey, weight, setModalVisible, sliderRef?.current, handleScrollValue, setBarbellCollapsed, modalVisible]);

  const { sendUpdate } = useWatch({
    enabled: !modalVisible && !logVisible,
    onNumberReceived: (value) => {
      if (value > 0) {
        handleScrollValue(value);
        sliderRef.current?.setValue?.(value);
      }
    },
  });

  useEffect(() => {
    sendUpdate({
      weight,
      unit,
      logs: plateDescription,
      label: `${unit === "kg" ? convert(weight, "kg") : weight.toString()} ${unit}`,
    });
  }, [weight, sendUpdate, unit, barbellId]);

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.flexOne}>
            <StatusBar style="light" />
            <ThemedView style={styles.container}>
              <Slider
                onValueChanged={onValueChanged}
                unit={unit}
                sliderValue={weight}
                ref={sliderRef}
              />
              <ThemedRoundButton
                onPress={() => setModalVisible(true)}
                barbellId={barbellId}
                unit={unit}
                onLogClicked={onLogClicked}
                logs={plateDescription}
                locked={false}
                dimmed={modalVisible || logVisible}
                onLogsIconClicked={() => setLogVisible(true)}
              />

              <Barbell
                key={barKey}
                platesPerSide={plates}
                unit={unit}
                collapsed={barbellCollapsed}
              />

              <CustomModal
                isVisible={modalVisible}
                onClose={onSettingsClose}
                title="Barlog Settings"
                buttonLabel="Save"
                description="What barbell plates per side do I need?"
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

              <CustomModal
                isVisible={logVisible}
                onClose={() => setLogVisible(false)}
                title="Log"
                description="Saved target weights"
                buttonLabel="Close"
                version={false}
              >
                <View style={{ flex: 1, minHeight: "100%", paddingTop: 15 }}>
                  <WeightLogList onItemTapped={onItemTapped} />
                </View>
              </CustomModal>

              <SlideCoachMark hidden={userScrolledOver} />
            </ThemedView>
            <VerticalRuler
              unit={unit}
              dimmed={modalVisible || logVisible}
            />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </View>
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
  watchIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    zIndex: 1000,
  },
});
