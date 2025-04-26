import * as React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors, tintColorDark, tintColorLight } from "@/src/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";

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
        <TouchableOpacity
          onPress={onPress}
          hitSlop={20}
        >
          <Text>
            <MaterialCommunityIcons
              name={unit === "kg" ? "weight-kilogram" : "weight-pound"}
              size={48}
              color={getColor()}
              style={[]}
            />
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return <>{renderIcon()}</>;
};

export type Props = {
  onPress: (unit: "lb" | "kg") => void;
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
    width: 75,
    height: 75,
    padding: 0,
    borderWidth: 4,
    borderColor: "transparent",
    borderRadius: 1024,
    paddingTop: 6,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});
