import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as React from "react";
import { SafeAreaView, StyleSheet, View, Text, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import { Colors, tintColorDark, tintColorLight } from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type WeightIconProps = {
  unit: "lb" | "kg";
  selected: boolean;
  onPress?: () => void;
};

const WeightIcon: React.FC<WeightIconProps> = ({ unit, selected, onPress }) => {
  const isDark = useColorScheme() === "dark";

  const getColor = React.useCallback(() => {
    if (selected) {
      return "red";
    }

    return isDark ? tintColorDark : Colors.light.shadowColor;
  }, [selected, isDark]);

  const renderIcon = () => {
    return (
      <View style={styles.iconContainer}>
        <GestureHandlerRootView>
          <TouchableOpacity
            onPress={onPress}
            hitSlop={20}
          >
            <Animated.Text>
              <MaterialCommunityIcons
                name={unit === "kg" ? "weight-kilogram" : "weight-pound"}
                size={44}
                color={getColor()}
              />
            </Animated.Text>
          </TouchableOpacity>
        </GestureHandlerRootView>
      </View>
    );
  };

  return <>{renderIcon()}</>;
};

export type Props = {
  onPress: (unit: "lb" | "kb" | string) => void;
  unit: "lb" | "kb" | string;
};

const SettingsUnit: React.FC<Props> = ({ onPress, unit }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <WeightIcon
        unit="lb"
        selected={unit === "lb"}
        onPress={() => onPress("lb")}
      />
      <WeightIcon
        unit="kg"
        onPress={() => onPress("kb")}
        selected={unit === "kb"}
      />
    </SafeAreaView>
  );
};

export default SettingsUnit;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  selected: {
    color: tintColorLight,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    width: 100,
    height: 40,
    padding: 0,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});