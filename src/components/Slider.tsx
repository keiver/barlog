import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { AccessibilityInfo, Dimensions, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { ReduceMotion } from "react-native-reanimated";
import RnVerticalSlider, { RNVSliderRef } from "rn-vertical-slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, tintColorDark, tintColorLight } from "@/src/constants/Colors";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

export type SliderProps = {
  onValueChanged: (value: number) => void;
  animateCallback?: (toValue: number) => void;
  unit?: string;
  sliderValue?: number;
};

const Slider = React.forwardRef<RNVSliderRef, SliderProps>(
  ({ onValueChanged, unit, sliderValue = 0 }: SliderProps, ref) => {
    const [value, setValue] = React.useState(sliderValue);
    const localRef = React.useRef<RNVSliderRef>(null);
    const [key, setKey] = React.useState(React.useId());
    const scheme = useColorScheme();
    const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

    const insets = useSafeAreaInsets();

    React.useEffect(() => {
      // Check if the user has enabled "Reduce Motion"
      AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
        setReduceMotionEnabled(isEnabled);
      });

      // Listen for changes in the "Reduce Motion" setting
      const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (isEnabled) => {
        setReduceMotionEnabled(isEnabled);
      });

      return () => {
        // Clean up the subscription when the component unmounts
        subscription?.remove();
      };
    }, []);

    React.useEffect(() => {
      const random = Math.random();
      setKey(random.toString());
    }, [scheme, unit]);

    const convert = React.useMemo(() => {
      if (unit === "lb") {
        return (value: number) => `${value}`;
      }

      return (value: number) => `${parseInt((value * 0.453592).toFixed(0))}`;
    }, [unit]);

    const sliderRef = (ref as React.RefObject<RNVSliderRef>) || localRef;

    const onChangeValue = React.useCallback(
      (newValue: number) => {
        setValue(newValue);
      },
      [setValue]
    );

    const onComplete = React.useCallback(
      (newValue: number) => {
        sliderRef.current?.setValue(newValue);
        onValueChanged(newValue);
      },
      [onValueChanged, sliderRef]
    );

    const { height, width } = useWindowDimensions();
    const maximumTrackTintColor = useThemeColor({}, "maximumTrackTintColor");
    const minimumTrackTintColor = useThemeColor({}, "minimumTrackTintColor");
    const isDark = useColorScheme() === "dark";
    const { height: windowHeight } = Dimensions.get("window");

    const getColor = React.useCallback(() => {
      if (value < windowHeight - 250) {
        return isDark ? tintColorDark : tintColorLight;
      }

      return !isDark ? Colors.light.shadowColor : tintColorDark;
    }, [isDark, value, windowHeight]);

    const renderIcon = () => {
      return (
        <View style={[styles.renderContainer, value < windowHeight - 250 ? styles.onTop : {}]}>
          <Animated.Text style={[styles.renderContainerText, { color: getColor() }]}>
            {convert(value)} {unit}
          </Animated.Text>
          {/* <ThemedText
            type="title"
            style={[styles.renderContainerText, { color: getColor() }]}
          >
            {convert(value)}
          </ThemedText> */}
        </View>
      );
    };

    return (
      <GestureHandlerRootView style={styles.flexOne}>
        <View
          style={{
            position: "relative", // Parent container
            backgroundColor: "#2C2C2E",
          }}
        >
          <View
            style={{
              position: "absolute",
              zIndex: 1,
              elevation: 1,
              overflow: "visible",
            }}
          >
            <View style={styles.container}>
              <RnVerticalSlider
                key={key}
                ref={sliderRef}
                value={value}
                disabled={false}
                min={0}
                max={800}
                step={1}
                animationConfig={{
                  duration: 1000,
                  dampingRatio: 0.4,
                  stiffness: 100,
                  reduceMotion: reduceMotionEnabled ? ReduceMotion.Never : ReduceMotion.System,
                  velocity: 3.5,
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
              <ThemedView
                style={[
                  styles.safeArea,
                  {
                    height: insets.bottom,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }
);

export default Slider;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    position: "absolute",
    zIndex: 0,
    elevation: 0,
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
    alignItems: "flex-start",
    justifyContent: "center",
    left: 35,
    position: "absolute",
    // height: 100,
    width: Dimensions.get("window").width - 20,
    zIndex: 2,
    elevation: 2,
  },
  onTop: {
    bottom: 0,
  },
  renderContainerText: {
    fontSize: 16,
    fontWeight: "700",
    // width: 50,
    transform: [{ translateX: -3 }],
    textAlign: "center",
    zIndex: 999,
    elevation: 999,
  },
  contentBox: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    paddingBottom: 44,
  },
  safeArea: {
    position: "absolute",
    bottom: 0,
    height: 45,
    width: Dimensions.get("window").width,
    backgroundColor: "transparent",
    zIndex: 2,
    elevation: 2,
  },
});
