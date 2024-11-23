import { StyleSheet, Dimensions, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors, tintColorDark, tintColorLight } from "@/constants/Colors";
import React from "react";
import storage from "@/app/libs/localStorage";
import { keys } from "@/constants/Storage";

const { width, height } = Dimensions.get("window");

export type SlideCoachMarkProps = {
  hidden?: boolean;
};

export function SlideCoachMark(props: SlideCoachMarkProps) {
  const isDark = useColorScheme() === "dark";
  const glowOpacity = useSharedValue(1);
  const movePosition = useSharedValue(0);
  const [alreadySeen, setAlreadySeen] = React.useState(true);
  const client = storage.getInstance();

  React.useEffect(() => {
    client.getData(keys.SAW_COACH_MARK).then((value) => {
      if (!!value) {
        setAlreadySeen(false);
      }
    });
  }, [client, setAlreadySeen]);

  // Start the glow animation
  glowOpacity.value = withRepeat(
    withSequence(withTiming(0.7, { duration: 800 }), withTiming(1, { duration: 800 })),
    -1, // Infinite repetition
    true
  );

  // Start the up and down movement animation
  movePosition.value = withRepeat(
    withSequence(withTiming(-10, { duration: 800 }), withTiming(10, { duration: 800 })),
    -1, // Infinite repetition
    true
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ translateY: movePosition.value }],
    };
  });

  if (props.hidden || alreadySeen === true || true) {
    return null;
  }

  return (
    <Animated.View style={[styles.chevronContainer, animatedStyle]}>
      <Entypo
        name="chevron-thin-up"
        size={24}
        color={isDark ? tintColorDark : tintColorLight}
        style={[styles.chevron]}
      />
      <Entypo
        name="chevron-thin-up"
        size={20}
        color={isDark ? tintColorDark : tintColorLight}
        style={[styles.chevron, { top: -30 }]}
      />
      <Entypo
        name="chevron-thin-up"
        size={16}
        color={isDark ? tintColorDark : tintColorLight}
        style={[styles.chevron, { top: -60 }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chevronContainer: {
    zIndex: 1,
    position: "absolute",
    elevation: 1,
    pointerEvents: "none",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  chevron: {
    fontSize: 150,
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 1,
    fontWeight: "100",
  },
  smallChevron: {
    position: "absolute",
    shadowColor: "gray",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 1,
  },
});
