import React from "react";
import { View, TouchableOpacity, StyleSheet, TextInput, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Colors, tintColorLight } from "@/constants/Colors";

import localStorage from "@/app/libs/localStorage";

interface SettingsBarbellWeightProps {
  sizes: number[];
  onPress: (size: number) => void;
  barbellWeight?: number;
  unit?: string;
}

const SettingsBarbellWeight: React.FC<SettingsBarbellWeightProps> = ({ barbellWeight, sizes, onPress, unit }) => {
  const inputRef = React.useRef<TextInput>(null);
  const isDark = useColorScheme() === "dark";
  const client = localStorage.getInstance();

  const onBlur = (e: any) => {
    const inputValue = e.nativeEvent?.text || e.target?.value || "";

    client.storeData("barbellWeight", inputValue);
    inputRef.current?.blur();
  };

  return (
    <View style={styles.centeredView}>
      {sizes?.map((size, index) => {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onPress(size)}
            style={styles.item}
            hitSlop={10}
          >
            <Ionicons
              name="barbell-sharp"
              size={size === 18 ? 30 : size}
              color={barbellWeight === size ? tintColorLight : isDark ? "white" : "black"}
            />
          </TouchableOpacity>
        );
      })}
      <TextInput
        ref={inputRef}
        style={styles.addInput}
        placeholder="Add"
        keyboardType="numeric"
        maxLength={5000}
        onBlur={onBlur}
        value={barbellWeight ? barbellWeight.toString() : ""}
        onChangeText={(text) => {
          if (text.length > 4) {
            return;
          }

          if (text === "") {
            return onPress(0);
          }

          if (text) {
            const size = parseFloat(text);

            if (!isNaN(size) && Number.isFinite(size)) {
              onPress(size);
            }
          }

          return;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    alignContent: "center",
    justifyContent: "space-around",
    flexWrap: "nowrap",
    height: "auto",
    width: "100%",
    textAlign: "center",
  },
  item: {
    alignContent: "center",
    justifyContent: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  itemSize: {
    fontSize: 16,
    marginBottom: -20,
    fontWeight: "400",
    textAlign: "center",
    marginLeft: -2,
  },
  addIcon: {
    position: "absolute",
    bottom: 8,
    right: 0,
    color: "gray",
  },
  addInput: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderTopColor: "gray",
    borderTopWidth: 1,
    borderLeftColor: "gray",
    borderLeftWidth: 1,
    borderRightColor: "gray",
    borderRightWidth: 1,
    // minWidth: 50,
    width: 80,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    margin: 10,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 16,
    color: "gray",
  },
});

export default SettingsBarbellWeight;
