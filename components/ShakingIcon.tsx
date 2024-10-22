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
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  styles?: any;
  unlocked?: boolean;
  animated?: boolean;
  hidden?: boolean;
};

const ShakingIcon = ({ styles, unlocked, animated, hidden }: Props) => {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (unlocked) {
      shake.value = 0;
      return;
    }

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
  }, [unlocked]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: shake.value }],
    };
  });

  if (hidden) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name={unlocked ? "unlock" : "lock"}
        color="#00FF00"
        style={[s.iconLock, styles, !unlocked && s.lockedState]}
        size={16}
      />
    </Animated.View>
  );
};

export default ShakingIcon;

const s = StyleSheet.create({
  iconLock: {
    transform: [{ rotate: "-90deg" }],
  },
  lockedState: {
    transform: [{ rotate: "-90deg" }, { translateX: -1 }],
  },
});
