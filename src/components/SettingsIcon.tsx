import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, Dimensions, View, useColorScheme } from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";
import { convert } from "@/src/libs/helpers";
import barbellWeights from "@/src/constants/barbells";
import { tintColorDark } from "../constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
  const iconOpacity = colorScheme === "dark" ? 0.7 : 1;
  const insets = useSafeAreaInsets();

  const getBarbellWeightByUnit = React.useCallback(() => {
    const bar = barbellWeights?.find((b) => b.id === barbellId);
    if (!bar) return "";
    return unit === "kg" ? bar.kg : bar.lbs;
  }, [barbellId, unit]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        dimmed && styles.dimmed,
        {
          height: "100%",
          minHeight: Dimensions.get("window").height,
        },
      ]}
    >
      <BlurView
        intensity={30}
        tint="light"
        style={[styles.modalView, { backgroundColor }]}
      >
        <TouchableOpacity
          onPress={onLogsIconClicked}
          style={styles.flex}
        >
          <View style={[styles.barIndicator, styles.indicatorStart]}>
            <MaterialCommunityIcons
              name="notebook-outline"
              color={iconColor}
              style={[styles.icon, { opacity: iconOpacity }]}
              size={28}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogClicked}>
          <View
            style={[styles.barIndicator]}
            id="logs"
          >
            <View style={styles.verticalTextContainer}>
              <ThemedText
                lightColor="#00FF00"
                darkColor="#00FF00"
                type="title"
                style={styles.verticalText}
                numberOfLines={1}
              >
                {/* <ThemedText
                  lightColor={tintColorDark}
                  darkColor={tintColorDark}
                  type="small"
                >
                  {locked ? "" : "Load"}&nbsp;&nbsp;
                </ThemedText> */}
                <ThemedText
                  lightColor={tintColorDark}
                  darkColor={tintColorDark}
                  type="small"
                >
                  Load &nbsp;&nbsp;&nbsp;
                </ThemedText>
                {logs || ""}
                <ThemedText
                  lightColor={tintColorDark}
                  darkColor={tintColorDark}
                  type="small"
                >
                  &nbsp;&nbsp;&nbsp;
                  {locked ? "Saved" : "Plates Per Side"}
                </ThemedText>
                {/* &nbsp;&nbsp;
                <Ionicons
                  name="save-outline"
                  color={tintColorDark}
                  style={[styles.icon1, { opacity: iconOpacity }]}
                  size={12}
                /> */}
                &nbsp;&nbsp;
                {/* <Ionicons
                  name="save-outline"
                  color={tintColorDark}
                  style={[
                    styles.icon1,
                    {
                      opacity: iconOpacity,
                    },
                  ]}
                  size={10}
                /> */}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPress}
          id="barbell"
        >
          <View style={[styles.barIndicator, styles.indicatorEnd]}>
            <View style={styles.barbellTextContainer}>
              <View style={[styles.barbellContent, { opacity: iconOpacity }]}>
                <TabBarIcon
                  name="barbell-outline"
                  color={iconColor}
                  style={styles.icon}
                  size={24}
                />
                <ThemedText
                  type="title"
                  lightColor="white"
                  style={styles.barbellText}
                >
                  {getBarbellWeightByUnit()} {unit}
                </ThemedText>
              </View>
            </View>
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
    zIndex: 1,
    elevation: 1,
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
    backgroundColor: "transparent",
  },
  modalView: {
    paddingLeft: 2,
    borderRadius: 0,
    overflow: "hidden",
    height: "100%",
    width: 48,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 50,
    width: 48,
    height: 48,
  },
  indicatorEnd: {
    justifyContent: "flex-end",
    marginBottom: -10,
    marginTop: 10,
    height: 200,
  },
  verticalTextContainer: {
    width: height - 350,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    position: "absolute",
  },
  verticalText: {
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    shadowColor: "darkgray",
    shadowOffset: {
      width: -2,
      height: 1,
    },
    shadowOpacity: 0.7,
    shadowRadius: 3,
  },
  barbellTextContainer: {
    width: 200, // Increased width to accommodate the text
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    position: "absolute",
    bottom: 70, // Adjust this value to position the barbell text correctly
  },
  barbellContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginRight: height * 0.1,
  },
  barbellText: {
    textAlign: "center",
    fontSize: 16,
  },
  icon: {
    alignSelf: "center",
  },
  icon1: {
    transform: [{ rotate: "90deg" }],
  },
  label: {
    textAlign: "center",
  },
  dimmed: {
    opacity: 0,
  },
});

export default ThemedRoundButton;
