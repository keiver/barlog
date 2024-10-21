import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { StyleSheet } from "react-native";

type Props = {
  styles?: any;
};

const ShakingIcon = ({ styles }: Props) => {
  const shake = useSharedValue(0);

  useEffect(() => {
    shake.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 100 }), // Move left
        withTiming(2, { duration: 200 }), // Move right
        withTiming(0, { duration: 100 }), // Return to center
        withTiming(0, { duration: 900 }) // Pause for 500ms
      ),
      -1, // Infinite repeats
      false // Do not reverse the animation
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: shake.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TabBarIcon
        name="lock-closed-outline"
        color="#00FF00"
        style={[s.iconLock, styles]}
        size={16}
      />
    </Animated.View>
  );
};

export default ShakingIcon;

const s = StyleSheet.create({
  iconLock: {
    // transform: [{ rotate: "-90deg" }, { translateY: 12 }, { translateX: 4 }],
  },
});
