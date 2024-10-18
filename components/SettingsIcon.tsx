import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, Dimensions, View, useColorScheme } from "react-native";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { BlurView } from "expo-blur";

export type ThemedButtonProps = {
  onPress: () => void;
  size?: number;
  iconColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  barbellWeight?: number;
  unit?: string;
  description?: string;
};

export function ThemedRoundButton({
  onPress,
  iconColor = "white",
  borderColor = "transparent",
  style,
  barbellWeight,
  unit,
  description,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme !== "dark" ? "#000000ab" : "#000000ab";

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={10}
      style={[styles.container, style]}
    >
      <BlurView
        intensity={50}
        tint="default"
        style={[styles.modalView, { backgroundColor }]}
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
            type="link"
          >
            {" "}
            Settings
          </ThemedText>
        </View>
        {description ? <ThemedText> | </ThemedText> : null}
        <ThemedText>{description}</ThemedText>
        <View style={styles.barIndicator}>
          <TabBarIcon
            name="barbell-outline"
            color={iconColor}
            style={styles.icon}
            size={24}
          />
          <ThemedText
            type="link"
            lightColor="white"
          >
            {" "}
            {barbellWeight} {unit}
          </ThemedText>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    borderColor: "red",
    padding: 0,
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 0,
    height: 54,
    // width: Dimensions.get("window").width,
    overflow: "hidden",
  },
  icon: {
    // transform: [{ translateY: -28 }],
  },
  barIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  modalView: {
    padding: 0,
    borderRadius: 0,
    overflow: "hidden",
    height: 54,
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 44,
    paddingLeft: 44,
  },
});
