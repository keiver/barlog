import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as React from "react";
import {
  AccessibilityInfo,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { ReduceMotion } from "react-native-reanimated";
import RnVerticalSlider, { RNVSliderRef } from "rn-vertical-slider";
import { ThemedText } from "./ThemedText";
import { Colors, tintColorDark, tintColorLight } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SliderProps = {
  onValueChanged: (value: number) => void;
  animateCallback?: (toValue: number) => void;
  unit?: string;
  barbellWeight?: number;
};

const Slider = React.forwardRef<RNVSliderRef, SliderProps>(
  ({ onValueChanged, unit, barbellWeight = 0 }: SliderProps, ref) => {
    const [value, setValue] = React.useState(barbellWeight);
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
        if (newValue < barbellWeight) {
          setValue(barbellWeight);
        } else {
          setValue(newValue);
        }
      },
      [barbellWeight, sliderRef]
    );

    const onComplete = React.useCallback(
      (newValue: number) => {
        if (newValue < barbellWeight) {
          sliderRef.current?.setValue(barbellWeight);
          onValueChanged(barbellWeight);
        } else {
          onValueChanged(newValue);
        }
      },
      [barbellWeight, onValueChanged, sliderRef]
    );

    const { height, width } = useWindowDimensions();
    const maximumTrackTintColor = useThemeColor({}, "maximumTrackTintColor");
    const minimumTrackTintColor = useThemeColor({}, "minimumTrackTintColor");
    const isDark = useColorScheme() === "dark";

    const getColor = React.useCallback(() => {
      if (value < 130) {
        return isDark ? tintColorDark : tintColorLight;
      }

      return !isDark ? Colors.light.shadowColor : tintColorDark;
    }, [isDark, value]);

    const renderIcon = () => {
      return (
        <View style={[styles.renderContainer, value < 130 ? styles.onTop : {}]}>
          <Animated.Text>
            <MaterialCommunityIcons
              adjustsFontSizeToFit
              name={unit === "lb" ? "weight-pound" : "weight-kilogram"}
              size={44}
              color={getColor()}
            />
          </Animated.Text>
          <ThemedText
            type="title"
            style={[styles.renderContainerText, { color: getColor() }]}
          >
            {convert(value)}
          </ThemedText>
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
                // containerStyle={{
                //   zIndex: 999,
                //   elevation: 999,
                //   position: "relative",
                //   overflow: "visible",
                // }}
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
    left: 20,
    // left: Dimensions.get("window").width - 110,
    position: "absolute",
    height: 100,
    width: Dimensions.get("window").width - 20,
    zIndex: 999, // Add this
    elevation: 999, // Add this for Android
  },
  onTop: {
    bottom: 0,
  },
  renderContainerText: {
    fontSize: 23,
    fontWeight: "700",
    width: 50,
    transform: [{ translateX: -3 }],
    textAlign: "center",
    zIndex: 999, // Add this
    elevation: 999, // Add this for Android
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
  },
});
