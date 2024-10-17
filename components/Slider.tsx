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
  unit?: string;
  barbellWeight?: number;
};

const Slider = React.forwardRef<RNVSliderRef, SliderProps>(({ onValueChanged, unit }: SliderProps, ref) => {
  const [value, setValue] = React.useState(0);
  const localRef = React.useRef<RNVSliderRef>(null);

  const convert = React.useMemo(() => {
    if (unit === "kg") {
      return (value: number) => `${value}`;
    }
    return (value: number) => `${value}`;
  }, [unit]);

  const renderIcon = () => {
    return (
      <View style={[styles.renderContainer, value < 100 ? styles.onTop : {}]}>
        <Animated.Text>
          <MaterialCommunityIcons
            adjustsFontSizeToFit
            name={unit === "kg" ? "weight-kilogram" : "weight-pound"}
            size={44}
            color="red"
          />
        </Animated.Text>
        <ThemedText
          type="title"
          style={styles.renderContainerText}
        >
          {convert(value)}
        </ThemedText>
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

  // Use forwarded ref if provided, otherwise fallback to localRef
  const sliderRef = (ref as React.RefObject<RNVSliderRef>) || localRef;

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <View style={styles.container}>
        <RnVerticalSlider
          ref={sliderRef}
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
          showIndicator={true}
          width={width}
          height={height}
          borderRadius={0}
          maximumTrackTintColor={maximumTrackTintColor}
          minimumTrackTintColor={minimumTrackTintColor}
          renderIndicator={renderIcon}
        />
      </View>
      <View
        style={styles.contentBox}
        pointerEvents="none"
      >
        {/* <ThemedText type="huge">{value}</ThemedText> */}
      </View>
    </GestureHandlerRootView>
  );
});

export default Slider;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    position: "absolute",
  },
  container: {
    position: "absolute",
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
    alignItems: "flex-end",
    justifyContent: "center",
    position: "absolute",
    height: 100,
    width: Dimensions.get("window").width - 20,
  },
  onTop: {
    bottom: 0,
  },
  renderContainerText: {
    fontSize: 23,
    color: "red",
    fontWeight: "700",
    width: 50,
    transform: [{ translateX: 3 }],
    textAlign: "center",
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
