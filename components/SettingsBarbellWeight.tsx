import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

interface SettingsBarbellWeightProps {
  sizes: number[];
  onPress: (size: number) => void;
}

const SettingsBarbellWeight: React.FC<SettingsBarbellWeightProps> = ({ sizes, onPress }) => {
  return (
    <View style={styles.centeredView}>
      {sizes?.map((size, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onPress(size)}
          style={styles.item}
        >
          <ThemedText>{size}</ThemedText>
          <Ionicons
            name="barbell-sharp"
            size={size}
            color="black"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    display: "flex",
    flexDirection: "row",
    gap: 30,
    alignContent: "center",
    justifyContent: "center",
    height: "auto",
  },
  item: {
    alignContent: "center",
    justifyContent: "center",
  },
});

export default SettingsBarbellWeight;
