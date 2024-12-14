import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, Dimensions, View, useColorScheme } from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";
import { convert } from "@/src/libs/helpers";
import barbellWeights from "@/src/constants/barbells";
import { tintColorDark } from "../constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type ThemedButtonProps = {
  onPress: () => void;
  size?: number;
  iconColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  barbellId?: string;
  unit?: string;
  logs?: string;
  onLogClicked?: () => void;
  onLogsIconClicked?: () => void;
  locked?: boolean;
  dimmed?: boolean;
};

export function ThemedRoundButton({
  onPress,
  iconColor = "white",
  style,
  barbellId,
  unit,
  logs = "",
  onLogClicked,
  onLogsIconClicked,
  locked,
  dimmed,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme !== "dark" ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.9)";

  const getBarbellWeightByUnit = React.useCallback(() => {
    const bar = barbellWeights?.find((b) => b.id === barbellId);

    if (!bar) {
      return "";
    }

    return unit === "kg" ? bar.kg : bar.lbs;
  }, [barbellId, unit, convert]);

  return (
    <TouchableOpacity style={[styles.container, style, dimmed && styles.dimmed]}>
      <BlurView
        intensity={30}
        tint="light"
        style={[styles.modalView, { backgroundColor }]}
      >
        <TouchableOpacity
          onPress={onLogsIconClicked}
          style={[styles.flex]}
        >
          <View style={[styles.barIndicator, styles.indicatorStart]}>
            <MaterialCommunityIcons
              name="notebook-outline"
              color={iconColor}
              style={[
                styles.icon,
                {
                  transform: [{ translateX: 0 }],
                  opacity: colorScheme === "dark" ? 0.7 : 1,
                },
              ]}
              size={28}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogClicked}>
          <View
            style={styles.barIndicator}
            id="logs"
          >
            <View style={styles.row}>
              <ThemedText
                lightColor="#00FF00"
                darkColor="#00FF00"
                type="title"
                style={[styles.label]}
              >
                <ThemedText
                  lightColor={tintColorDark}
                  darkColor={tintColorDark}
                  type="small"
                  style={[styles.label]}
                >
                  {locked ? "" : "Load"}&nbsp;&nbsp;
                </ThemedText>
                {logs || ""}
                <ThemedText
                  lightColor={tintColorDark}
                  darkColor={tintColorDark}
                  type="small"
                  style={[styles.label]}
                >
                  &nbsp;&nbsp;
                  {locked ? "Saved" : "Per Side"}
                </ThemedText>
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress}>
          <View
            style={[
              styles.barIndicator,
              styles.indicatorEnd,
              {
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: "90deg" }],
                gap: 10,
                width: 70,
                opacity: colorScheme === "dark" ? 0.7 : 1,
              },
            ]}
          >
            <TabBarIcon
              name="barbell-outline"
              color={iconColor}
              style={styles.icon}
              size={24}
            />
            <ThemedText
              type="title"
              lightColor="white"
              style={[styles.label]}
            >
              {getBarbellWeightByUnit()} {unit}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </BlurView>
    </TouchableOpacity>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    zIndex: 0,
    elevation: 0,
  },
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    opacity: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    padding: 0,
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 0,
    backgroundColor: "#00",
  },
  icon: {
    // transform: [{ translateY: -2 }, { rotate: "90deg" }],
  },
  barIndicator: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: height - 350,
  },
  indicatorStart: {
    justifyContent: "flex-end",
    alignItems: "center",
    // width: 150,
    marginTop: 50,
    width: 48,
    height: 48,
  },
  indicatorEnd: {
    justifyContent: "flex-end",
    marginBottom: -20,
    marginTop: 10,
    height: 200,
  },
  modalView: {
    paddingLeft: 2,
    borderRadius: 0,
    overflow: "hidden",
    height: Dimensions.get("window").height,
    width: 48,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    position: "relative",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
    verticalAlign: "middle",
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    textAlignVertical: "center",
    transform: [
      { rotate: "90deg" },
      {
        translateX: 25,
      },
    ],
    shadowColor: "darkgray",
    shadowOffset: {
      width: -2,
      height: 1,
    },
    shadowOpacity: 0.7,
    shadowRadius: 3,
  },
  iconLock: {
    marginLeft: 15,
    marginBottom: 1,
  },
  dimmed: {
    opacity: 0,
  },
  row: {
    transform: [{ rotate: "90deg" }],
    position: "relative",
    top: 0,
    right: 0,
    height: 32,
    overflow: "hidden",
  },
});
