import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import * as React from "react"
import {SafeAreaView, StyleSheet, Text, useWindowDimensions, View} from "react-native"
import {GestureHandlerRootView} from "react-native-gesture-handler"
import Animated from "react-native-reanimated"
import RnVerticalSlider, {RNVSliderRef} from "rn-vertical-slider"
import {ThemedText} from "./ThemedText"
import {Colors} from "@/constants/Colors"
import {useThemeColor} from "@/hooks/useThemeColor"

export type SliderProps = {
  onValueChanged: (value: number) => void
}

const Slider: React.FC<SliderProps> = ({onValueChanged}: SliderProps) => {
  const [value, setValue] = React.useState(1)
  const ref = React.useRef<RNVSliderRef>(null)
  // Icon render
  const renderIcon = () => {
    return (
      <View style={styles.renderContainer}>
        <Animated.Text>
          <MaterialCommunityIcons adjustsFontSizeToFit name="weight-pound" size={44} color="red" />
        </Animated.Text>
        <ThemedText style={styles.renderContainerText}>{value}</ThemedText>
      </View>
    )
  }
  // Helper functions
  const onChangeValue = (newValue: number) => {
    console.log("🚀 ~ file: App.tsx:51 ~ onChangeValue ~ value:", value)
    setValue(newValue)
  }

  const onManualChange = (newValue: number) => () => {
    ref.current?.setValue(newValue)
  }

  const {height} = useWindowDimensions()
  const maximumTrackTintColor = useThemeColor({}, "maximumTrackTintColor")
  const minimumTrackTintColor = useThemeColor({}, "minimumTrackTintColor")

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <SafeAreaView style={styles.flexOne}>
        <View style={styles.container}>
          <RnVerticalSlider
            ref={ref}
            value={value}
            disabled={false}
            min={0}
            max={600}
            step={5}
            animationConfig={{
              duration: 1000,
              dampingRatio: 0.4
            }}
            onChange={onChangeValue}
            onComplete={(v: number) => {
              onValueChanged?.(v)
            }}
            showIndicator
            renderIndicatorHeight={40}
            width={50}
            height={height - 150}
            borderRadius={25}
            maximumTrackTintColor={maximumTrackTintColor}
            minimumTrackTintColor={minimumTrackTintColor}
            renderIndicator={renderIcon}
          />
        </View>
        <View style={styles.contentBox}>
          <ThemedText>content: {value}</ThemedText>
        </View>
        {/* <View style={styles.contentBox}>
          <Text onPress={onManualChange(70)}>Set to 70</Text>
        </View> */}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default Slider

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    position: "relative"
  },
  container: {
    position: "absolute",
    top: 10,
    left: -60,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#171717",
    shadowOffset: {
      width: -2,
      height: 4
    },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  renderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    height: 50,
    left: 60,
    marginRight: 10
  },
  renderContainerText: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold"
  },
  contentBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 20
  }
})
