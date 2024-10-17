import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";

interface PlateProps {
  weight: number;
  width: number;
  height: number;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>; // style prop can accept ViewStyle
}

const Plate: React.FC<PlateProps> = ({
  weight,
  width,
  height,
  color = "gray",
  borderColor = "black",
  borderWidth = 2,
  style,
}) => {
  const dynamicFontSize = Math.max(width * 0.15, 14); // Adjust font size based on plate width
  const dynamicBorderColor = weight >= 20 ? "red" : borderColor; // Color change based on weight

  // Correct typing: plateStyle is now explicitly typed as ViewStyle
  const plateStyle: ViewStyle = {
    width,
    height,
    backgroundColor: color,
    borderRadius: width / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth,
    borderColor: dynamicBorderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  };

  return (
    <View
      style={[styles.plate, plateStyle, style]} // Apply array of styles correctly
      accessible={true}
      accessibilityLabel={`Weight plate of ${weight} kilograms`}
    >
      <Text style={[styles.weightText, { fontSize: dynamicFontSize }]}>{weight} kg</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  plate: {
    margin: 10,
  },
  weightText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Plate;
