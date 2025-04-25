import React from "react";
import {
  AccessibilityInfo,
  Dimensions,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { ReduceMotion } from "react-native-reanimated";
import RnVerticalSlider, { RNVSliderRef } from "../Slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, tintColorDark, tintColorLight } from "@/src/constants/Colors";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";

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
      AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
        setReduceMotionEnabled(isEnabled);
      });

      const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (isEnabled) => {
        setReduceMotionEnabled(isEnabled);
      });

      return () => {
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

    const onTop = React.useMemo(() => {
      return value < windowHeight - 250;
    }, [value, windowHeight]);

    const getColor = React.useCallback(() => {
      if (onTop) {
        return isDark ? tintColorDark : tintColorLight;
      }

      return tintColorDark;
    }, [isDark, value, windowHeight, onTop]);

    const getSafeAreaColor = React.useCallback(() => {
      return isDark ? Colors.dark.minimumTrackTintColor : Colors.light.minimumTrackTintColor;
    }, [isDark]);

    const renderIcon = () => {
      return (
        <View style={[styles.renderContainer, onTop ? styles.onTop : {}]}>
          <Animated.Text style={[styles.renderContainerText, { color: getColor() }]}>
            {convert(value)} {unit}
          </Animated.Text>
        </View>
      );
    };

    return (
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.wrapper}>
          <RnVerticalSlider
            key={key}
            ref={sliderRef}
            value={value}
            disabled={false}
            min={0}
            max={800}
            step={1}
            snapInterval={unit === "kg" ? 2.5 : 5}
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
            containerStyle={styles.sliderContainer}
            maximumTrackTintColor={maximumTrackTintColor}
            minimumTrackTintColor={minimumTrackTintColor}
            renderIndicator={renderIcon}
          />
          <ThemedView
            style={[
              styles.safeArea,
              {
                height: insets.bottom < value ? insets.bottom : value,
                backgroundColor: getSafeAreaColor(),
              },
            ]}
          />
        </View>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    position: Platform.OS === "ios" ? "absolute" : "relative",
  },
  wrapper: {
    flex: 1,
    position: "relative",
  },
  sliderContainer: {
    position: "relative",
    flex: 1,
    alignSelf: "stretch",
    shadowColor: "#171717",
    shadowOffset: {
      width: -2,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  renderContainer: {
    position: "relative",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 35,
    width: Dimensions.get("window").width - 20,
  },
  onTop: {
    alignItems: "flex-start",
  },
  renderContainerText: {
    fontSize: 16,
    fontWeight: "700",
    transform: [{ translateX: -3 }],
    textAlign: "center",
  },
  safeArea: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 0,
    elevation: 0,
  },
});

export default Slider;
