import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as React from "react";
import { SafeAreaView, StyleSheet, View, Text, useColorScheme } from "react-native";
import Animated from "react-native-reanimated";
import { Colors, tintColorDark, tintColorLight } from "@/constants/Colors";
import storageClient from "@/app/libs/localStorage";
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

const SettingsUnit: React.FC = () => {
  const [storedUnit, setStoredUnit] = React.useState<string | null>();

  const c = storageClient.getInstance();

  React.useEffect(() => {
    c.getData("unit").then((u) => {
      console.log("%ccomponents/SettingsUnit.tsx:58 u", "color: #007acc;", u);
      if (u) {
        setStoredUnit(u);
      }
    });
  }, [setStoredUnit]);

  const onPress = React.useCallback(
    (n: string) => {
      setStoredUnit(n);
    },
    [storedUnit, setStoredUnit]
  );
  console.log("%ccomponents/SettingsUnit.tsx:71 storedUnit", "color: #007acc;", storedUnit);
  return (
    <SafeAreaView style={styles.container}>
      <WeightIcon
        unit="lb"
        selected={storedUnit === "lb"}
        onPress={() => onPress("lb")}
      />

      <WeightIcon
        unit="kg"
        onPress={() => onPress("kb")}
        selected={storedUnit === "kb"}
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
    height: 80,
    fontSize: 58,
    padding: 20,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});
