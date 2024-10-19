import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as React from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import RnVerticalSlider, { RNVSliderRef } from "rn-vertical-slider";
import { ThemedText } from "./ThemedText";
import { Colors, tintColorDark, tintColorLight } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export type SliderProps = {
  onValueChanged: (value: number) => void;
  animateCallback?: (toValue: number) => void;
  unit?: string;
  barbellWeight?: number;
};

const Slider = React.forwardRef<RNVSliderRef, SliderProps>(
  ({ onValueChanged, unit, barbellWeight }: SliderProps, ref) => {
    const [value, setValue] = React.useState(0);
    const localRef = React.useRef<RNVSliderRef>(null);
    const [key, setKey] = React.useState(React.useId());
    const scheme = useColorScheme();

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

    const onChangeValue = React.useCallback((newValue: number) => {
      setValue(newValue);
    }, []);

    const onComplete = React.useCallback((newValue: number) => {
      onValueChanged(newValue);
    }, []);

    const { height, width } = useWindowDimensions();
    const maximumTrackTintColor = useThemeColor({}, "maximumTrackTintColor");
    const minimumTrackTintColor = useThemeColor({}, "minimumTrackTintColor");
    const isDark = useColorScheme() === "dark";
    const sliderRef = (ref as React.RefObject<RNVSliderRef>) || localRef;

    const renderIcon = () => {
      return (
        <View style={[styles.renderContainer, value < 100 ? styles.onTop : {}]}>
          <Animated.Text>
            <MaterialCommunityIcons
              adjustsFontSizeToFit
              name={unit === "lb" ? "weight-pound" : "weight-kilogram"}
              size={44}
              color={!isDark && value > 100 ? Colors.light.shadowColor : minimumTrackTintColor}
            />
          </Animated.Text>
          <ThemedText
            type="title"
            style={[
              styles.renderContainerText,
              { color: !isDark && value > 100 ? Colors.light.shadowColor : minimumTrackTintColor },
            ]}
          >
            {convert(value)}
          </ThemedText>
        </View>
      );
    };

    return (
      <GestureHandlerRootView style={styles.flexOne}>
        <View style={styles.container}>
          <RnVerticalSlider
            key={key}
            ref={sliderRef}
            value={value}
            disabled={false}
            min={barbellWeight || 0}
            max={800}
            step={1}
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
    left: 10,
    position: "absolute",
    height: 100,
    width: Dimensions.get("window").width - 20,
  },
  onTop: {
    bottom: 0,
    color: "white",
  },
  renderContainerText: {
    fontSize: 23,
    fontWeight: "700",
    width: 50,
    transform: [{ translateX: -3 }],
    textAlign: "center",
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
});
