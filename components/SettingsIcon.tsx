import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, Dimensions, View, useColorScheme } from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";

export type ThemedButtonProps = {
  onPress: () => void;
  size?: number;
  iconColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  barbellWeight?: number;
  unit?: string;
  logs?: string;
  onLogClicked?: () => void;
  locked?: boolean;
  dimmed?: boolean;
};

export function ThemedRoundButton({
  onPress,
  iconColor = "white",
  style,
  barbellWeight,
  unit,
  logs = "",
  onLogClicked,
  locked,
  dimmed,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme !== "dark" ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.9)";

  const getBarbellWeightByUnit = React.useCallback(() => {
    return barbellWeight;
  }, [barbellWeight, unit]);

  return (
    <TouchableOpacity style={[styles.container, style, dimmed && styles.dimmed]}>
      <BlurView
        intensity={30}
        tint="light"
        style={[styles.modalView, { backgroundColor }]}
      >
        <TouchableOpacity
          onPress={onPress}
          hitSlop={50}
          style={[styles.flex]}
        >
          <View style={styles.barIndicator}>
            <TabBarIcon
              name="settings-outline"
              color={iconColor}
              style={styles.icon}
              size={18}
            />
            <ThemedText
              lightColor="white"
              type="title"
              style={[styles.label]}
            >
              Settings
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogClicked}
          hitSlop={50}
        >
          <View style={styles.barIndicator}>
            <View style={styles.row}>
              <ThemedText
                lightColor="#00FF00"
                darkColor="#00FF00"
                type="title"
                style={[styles.label]}
              >
                {logs || ""}

                {logs ? (
                  <ThemedText
                    lightColor="yellow"
                    darkColor="yellow"
                    type="small"
                    style={[styles.label]}
                  >
                    &nbsp;&nbsp;
                    {locked ? "Marked" : "Per Side"}
                  </ThemedText>
                ) : (
                  ""
                )}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPress}
          hitSlop={30}
        >
          <View style={styles.barIndicator}>
            <TabBarIcon
              name="barbell-outline"
              color={iconColor}
              style={styles.icon}
              size={18}
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    padding: 0,
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 0,
  },
  icon: {
    transform: [{ translateY: -2 }, { rotate: "90deg" }],
  },
  barIndicator: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    height: Dimensions.get("window").height / 3, // number of buttons
  },
  modalView: {
    paddingLeft: 2,
    borderRadius: 0,
    overflow: "hidden",
    height: Dimensions.get("window").height,
    width: 38,
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
    flexDirection: "column",
  },
});
