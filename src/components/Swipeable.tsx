import React, {useRef} from "react"
import {View, Text, StyleSheet} from "react-native"
import {PanGestureHandler, GestureHandlerRootView, ScrollView} from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
  interpolate,
  Extrapolate,
  Extrapolation
} from "react-native-reanimated"

interface SwipeableItemProps {
  onDelete: () => void
  children: React.ReactNode
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({onDelete, children}) => {
  const translateX = useSharedValue(0)
  const threshold = 150
  const deleteTriggered = useSharedValue(false)
  const isSwipeActive = useSharedValue(false)

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value
      deleteTriggered.value = false
      isSwipeActive.value = false
    },
    onActive: (event, context: any) => {
      const newTranslateX = context.startX + event.translationX
      translateX.value = newTranslateX

      if (Math.abs(event.velocityX) > 0) {
        isSwipeActive.value = true
      }
    },
    onEnd: event => {
      isSwipeActive.value = false

      if (translateX.value < -threshold) {
        deleteTriggered.value = true
        runOnJS(onDelete)()
        translateX.value = withSpring(-threshold)
      } else {
        translateX.value = withSpring(0)
      }

      if (Math.abs(translateX.value) < threshold) {
        translateX.value = withSpring(0)
      } else if (!deleteTriggered.value) {
        deleteTriggered.value = true
        runOnJS(onDelete)()
        translateX.value = withSpring(0)
      }
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate opacity based on swipe progress
    const opacity = interpolate(Math.abs(translateX.value), [0, threshold], [1, 0.1], Extrapolation.CLAMP)

    return {
      transform: [{translateX: translateX.value}],
      opacity
    }
  })

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]} failOffsetY={[-10, 10]}>
        <Animated.View style={[styles.swipeable, animatedStyle]}>{children}</Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

export default SwipeableItem

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    overflow: "hidden"
  },
  swipeable: {
    borderRadius: 8,
    elevation: 3,
    backgroundColor: "transparent",
    overflow: "hidden"
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    backgroundColor: "#FF6B6B",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  iconText: {
    fontSize: 24,
    color: "#FFF"
  }
})
