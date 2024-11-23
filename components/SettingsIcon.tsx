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
  const backgroundColor = colorScheme !== "dark" ? "#000000ab" : "#000000ab";

  const getBarbellWeightByUnit = React.useCallback(() => {
    return barbellWeight;
  }, [barbellWeight, unit]);

  return (
    <TouchableOpacity style={[styles.container, style, dimmed && styles.dimmed]}>
      <BlurView
        intensity={30}
        tint="default"
        style={[styles.modalView, { backgroundColor }]}
      >
        <TouchableOpacity
          onPress={onPress}
          hitSlop={30}
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
              type="default"
              style={[styles.label, { fontFamily: "NovaSquare_400Regular" }]}
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
            <ThemedText
              lightColor="#00FF00"
              darkColor="#00FF00"
              type="small"
              style={[styles.label, { fontFamily: "NovaSquare_400Regular" }]}
            >
              {logs || ""} {locked ? " ◯ " : ""}
            </ThemedText>
            {/* <ShakingIcon
              styles={[styles.iconLock]}
              unlocked={!locked}
              animated={locked}
              hidden={!logs}
            /> */}
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
              type="default"
              lightColor="white"
              style={[styles.label, { fontFamily: "NovaSquare_400Regular" }]}
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
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    borderColor: "red",
    padding: 0,
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 0,
    // minHeight: Dimensions.get("window").height,
    // overflow: "hidden",
    // transform: [
    //   { rotate: "270deg" },
    //   { translateY: Dimensions.get("window").width / 2.12 },
    //   { translateX: -Dimensions.get("window").width / 1.3 },
    // ],
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
    // lineHeight: 16,
    width: Dimensions.get("window").height / 3 + 100,
    // minWidth: 100,
    // height: 19,
    textAlign: "center",
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
    // transform: [{ rotate: "-90deg" }],
    marginLeft: 15,
    marginBottom: 1,
  },
  dimmed: {
    opacity: 0.1,
  },
});
