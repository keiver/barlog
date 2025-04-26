import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedRef,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TSliderProps = {
  min: number;
  max: number;
  step?: number;
  width: number;
  height: number;
  borderRadius?: number;
  maximumTrackTintColor?: string;
  minimumTrackTintColor?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  onComplete?: (value: number) => void;
  value?: number;
  showIndicator?: boolean;
  renderIndicator?: (value: number) => JSX.Element | null;
  containerStyle?: StyleProp<ViewStyle>;
  sliderStyle?: StyleProp<ViewStyle>;
  renderIndicatorHeight?: number;
  animationConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
    overshootClamping?: boolean;
    restDisplacementThreshold?: number;
    restSpeedThreshold?: number;
  };
  snapInterval?: number;
};

export type TSliderRef = {
  setValue: (value: number) => void;
  setState: (state: boolean) => void;
};

const RNVerticalSlider = forwardRef<TSliderRef, TSliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      width = 350,
      height = 30,
      borderRadius = 5,
      maximumTrackTintColor = "#3F2DA5",
      minimumTrackTintColor = "#77ADE6",
      disabled = false,
      onChange = () => {},
      onComplete = () => {},
      value: currentValue = 0,
      showIndicator = false,
      renderIndicatorHeight = 40,
      renderIndicator = () => null,
      containerStyle = {},
      sliderStyle = {},
      animationConfig = { damping: 10, stiffness: 250 },
      snapInterval = 5,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const point = useSharedValue<number>(currentValue);
    const disabledProp = useSharedValue<boolean>(disabled);
    const lastSnappedValue = useSharedValue<number>(currentValue);
    const containerRef = useAnimatedRef<View>();
    const [containerTop, setContainerTop] = useState(0);

    useEffect(() => {
      runOnJS(() => {
        Haptics.selectionAsync();
      })();
    }, [currentValue]);

    const significantNumbers = useMemo(() => {
      const numbers = [];
      for (let i = Math.ceil(min / snapInterval) * snapInterval; i <= max; i += snapInterval) {
        numbers.push(i);
      }
      return numbers;
    }, [min, max, snapInterval]);

    const SNAP_THRESHOLD = step * 1.5;

    const calculateValue = (position: number): number => {
      "worklet";
      let sliderPosition = height - position;
      sliderPosition = Math.min(Math.max(sliderPosition, 0), height);
      let value = (sliderPosition / height) * (max - min) + min;
      value = Math.round(value / step) * step;
      return Math.min(Math.max(value, min), max);
    };

    const findNearestSnap = (value: number) => {
      "worklet";
      let nearest = value;
      let minDiff = Number.MAX_VALUE;
      for (const sig of significantNumbers) {
        const diff = Math.abs(sig - value);
        if (diff < minDiff) {
          nearest = sig;
          minDiff = diff;
        }
      }
      return nearest;
    };

    const baseViewStyle = useMemo(
      () => ({ height, width, borderRadius, backgroundColor: maximumTrackTintColor }),
      [borderRadius, height, maximumTrackTintColor, width]
    );

    const handleGesture =
      (type: "BEGIN" | "CHANGE" | "END") =>
      (eventY: number, velocityY: number, translationY: number, absoluteY: number) => {
        if (disabledProp.value) return;

        const androidOffset = Platform.OS === "android" ? insets.top : 0;
        const relativeY = absoluteY - containerTop - androidOffset;

        let newValue = calculateValue(relativeY);

        const isTap = Math.abs(translationY) < 10;

        if (isTap && (type === "END" || type === "CHANGE")) {
          newValue = findNearestSnap(newValue);
        } else {
          for (const sig of significantNumbers) {
            if (Math.abs(newValue - sig) <= SNAP_THRESHOLD) {
              newValue = sig;
              break;
            }
          }
        }

        // if (Math.abs(newValue - lastSnappedValue.value) >= SNAP_THRESHOLD) {
        //   runOnJS(() => {
        //     Haptics.selectionAsync();
        //   })();
        //   lastSnappedValue.value = newValue;
        // }

        if (type === "CHANGE") {
          point.value = newValue;
          runOnJS(onChange)(newValue);
        } else {
          point.value = withSpring(newValue, animationConfig);
          runOnJS(type === "END" ? onComplete : onChange)(newValue);
        }
      };

    const panGesture = Gesture.Pan()
      .onBegin((e) => handleGesture("BEGIN")(e.y, e.velocityY, e.translationY, e.absoluteY))
      .onChange((e) => handleGesture("CHANGE")(e.y, e.velocityY, e.translationY, e.absoluteY))
      .onEnd((e) => handleGesture("END")(e.y, e.velocityY, e.translationY, e.absoluteY))
      .onFinalize((e) => handleGesture("END")(e.y, e.velocityY, e.translationY, e.absoluteY))
      .runOnJS(true);

    useImperativeHandle(ref, () => ({
      setValue: (value: number) => {
        point.value = withSpring(value, animationConfig);
        onChange(value);
      },
      setState: (state: boolean) => {
        disabledProp.value = state;
      },
    }));

    const slider = useAnimatedStyle(() => {
      const heightPercentage = ((point.value - min) / (max - min)) * 100;
      return {
        backgroundColor: minimumTrackTintColor,
        height: `${heightPercentage}%`,
        borderTopColor: "#c0392b",
        borderTopWidth: 1,
      };
    });

    const indicator = useAnimatedStyle(() => {
      const bottom = ((point.value - min) / (max - min)) * height;
      return {
        bottom: Math.min(Math.max(bottom, 0), height - renderIndicatorHeight),
      };
    });

    const handleLayout = (event: any) => {
      setContainerTop(event.nativeEvent.layout.y);
    };

    return (
      <GestureDetector gesture={panGesture}>
        <View
          ref={containerRef}
          onLayout={handleLayout}
          style={[baseViewStyle, containerStyle]}
        >
          <View style={[baseViewStyle, styles.box, sliderStyle]}>
            <Animated.View style={[styles.box, slider]} />
          </View>
          {showIndicator && (
            <Animated.View style={[styles.indicator, indicator]}>{renderIndicator(point.value)}</Animated.View>
          )}
        </View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  box: { overflow: "hidden", position: "absolute", bottom: 0, width: "100%" },
  indicator: { position: "absolute" },
});

export default RNVerticalSlider;
export type { TSliderProps as RNVSliderProps, TSliderRef as RNVSliderRef };
