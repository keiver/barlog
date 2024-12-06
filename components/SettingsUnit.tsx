import * as React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View, useColorScheme } from "react-native";
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
      return tintColorLight;
    }

    return isDark ? "white" : "black";
  }, [selected, isDark]);

  const renderIcon = () => {
    return (
      <View style={[styles.iconContainer, selected ? styles.selected : {}]}>
        <GestureHandlerRootView>
          <TouchableOpacity
            onPress={onPress}
            hitSlop={20}
          >
            <Animated.Text>
              <MaterialCommunityIcons
                name={unit === "kg" ? "weight-kilogram" : "weight-pound"}
                size={34}
                color={getColor()}
                style={[]}
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
  onPress: (unit: "lb" | "kg" | string) => void;
  unit: "lb" | "kg" | string;
};

const SettingsUnit: React.FC<Props> = ({ onPress, unit }: Props) => {
  return (
    <View style={styles.container}>
      <WeightIcon
        unit="lb"
        selected={unit === "lb"}
        onPress={() => onPress("lb")}
      />
      <WeightIcon
        unit="kg"
        onPress={() => onPress("kg")}
        selected={unit === "kg"}
      />
    </View>
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
    backgroundColor: Colors.light.maximumTrackTintColor,
    borderColor: tintColorDark,
    borderWidth: 4,
    borderRadius: 1024,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    width: 50,
    height: 50,
    padding: 0,
    borderWidth: 4,
    borderColor: "transparent",
    borderRadius: 1024,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});
