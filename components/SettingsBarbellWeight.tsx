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
          hitSlop={10}
        >
          <ThemedText style={styles.itemSize}>{size}</ThemedText>
          <Ionicons
            name="barbell-sharp"
            size={size === 18 ? 30 : size}
            color="black"
          />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => alert("Add new size")}
        style={styles.addIcon}
        hitSlop={10}
      >
        <Ionicons
          name="add-circle"
          size={40}
          color="gray"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    display: "flex",
    flexDirection: "row",
    gap: 40,
    alignContent: "space-evenly",
    justifyContent: "flex-start",
    height: "auto",
    width: "100%",
    textAlign: "center",
  },
  item: {
    alignContent: "center",
    justifyContent: "center",
  },
  itemSize: {
    fontSize: 16,
    marginBottom: -7,
    fontWeight: "700",
    textAlign: "center",
    marginLeft: -2,
  },
  addIcon: {
    position: "absolute",
    bottom: 8,
    right: 0,
    color: "gray",
  },
});

export default SettingsBarbellWeight;
