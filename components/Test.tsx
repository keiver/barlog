import React from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const TestIcon = () => {
  return (
    <View>
      <FontAwesome
        name="lock"
        size={50}
        color="#00FF00"
      />
    </View>
  );
};

export default TestIcon;
