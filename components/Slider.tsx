import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as React from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import RnVerticalSlider, { RNVSliderRef } from "rn-vertical-slider";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export type SliderProps = {
  onValueChanged: (value: number) => void;
  animateCallback?: (toValue: number) => void;
};

const Slider: React.FC<SliderProps> = ({ onValueChanged }: SliderProps) => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<RNVSliderRef>(null);
  // Icon render
  const renderIcon = () => {
    return (
      <View style={styles.renderContainer}>
        <Animated.Text>
          <MaterialCommunityIcons
            adjustsFontSizeToFit
            name="weight-pound"
            size={44}
            color="red"
          />
        </Animated.Text>
        <ThemedText style={styles.renderContainerText}>{value}</ThemedText>
      </View>
    );
  };
  const onChangeValue = React.useCallback((newValue: number) => {
    setValue(newValue);
  }, []);

  const onComplete = React.useCallback((newValue: number) => {
    onValueChanged(newValue);
  }, []);

  const { height, width } = useWindowDimensions();
  const maximumTrackTintColor = useThemeColor({}, "maximumTrackTintColor");
  const minimumTrackTintColor = useThemeColor({}, "minimumTrackTintColor");

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <View style={styles.container}>
        <RnVerticalSlider
          ref={ref}
          value={value}
          disabled={false}
          min={0}
          max={800}
          step={5}
          animationConfig={{
            duration: 1000,
            dampingRatio: 0.4,
            stiffness: 100,
          }}
          onChange={onChangeValue}
          onComplete={onComplete}
          showIndicator={false}
          width={width}
          height={height}
          borderRadius={0}
          maximumTrackTintColor={maximumTrackTintColor}
          minimumTrackTintColor={minimumTrackTintColor}
        />
      </View>
      <View
        style={styles.contentBox}
        pointerEvents="none"
      >
        <ThemedText type="huge">{value}</ThemedText>
      </View>
    </GestureHandlerRootView>
  );
};

export default Slider;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    position: "relative",
  },
  container: {
    position: "relative",

    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#171717",
    shadowOffset: {
      width: -2,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  renderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    height: 200,
    // left: 80,
    // marginRight: 10
  },
  renderContainerText: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold",
  },
  contentBox: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
});
