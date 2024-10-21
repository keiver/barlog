import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import Barbell from "./Bar";

export interface BWProps {
  // platesPerSide={plates}
  //       unit={unit}
  //       collapsed={

  platesPerSide: Record<number, number>;
  unit: string;
  barbelCollapsed: boolean;
}

export function BW({ platesPerSide, unit, barbelCollapsed }: BWProps) {
  return (
    <View style={styles.root}>
      <Barbell
        platesPerSide={platesPerSide}
        unit={unit}
        collapsed={barbelCollapsed} // TODO: Implement collapsible barbell
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "transparent",
    pointerEvents: "none",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
});
