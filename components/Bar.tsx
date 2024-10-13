import * as React from "react"
import {View, StyleSheet, Animated, Dimensions} from "react-native"
import {Colors} from "@/constants/Colors"
import {ThemedText} from "./ThemedText"

interface BarbellProps {
  platesPerSide: Record<number, number>
  barType?: string
  weightUnit?: string
  barWeight?: number
}

const plateColors: Record<number, string> = {
  45: "#ff0000", // Red (25 kg / 55 lb)
  35: "#0000ff", // Blue (20 kg / 44 lb)
  25: "#ffff00", // Yellow (15 kg / 33 lb)
  15: "#00ff00", // Green (10 kg / 22 lb)
  10: "#ff69b4", // Pink (5 kg / 11 lb)
  5: "#9b59b6", // Purple (official CrossFit color for smaller plates)
  2.5: "#a0a0a0", // Gray (2.5 kg / 5.5 lb)
  1.25: "#ffffff" // White (1.25 kg / 2.75 lb)
}

/**
 * The official CrossFit plate colors follow the International Weightlifting Federation (IWF) standards.
 * CrossFit competitions commonly use kilogram-based plate colors, but they are often converted to pounds.
 * The IWF standard color codes are:
 * - Red: 25 kg (55 lb)
 * - Blue: 20 kg (44 lb)
 * - Yellow: 15 kg (33 lb)
 * - Green: 10 kg (22 lb)
 * Smaller plates have varying colors, with purple being popular for smaller sizes in CrossFit.
 */

class BarbellLoader {
  private static instance: BarbellLoader
  private platesPerSide: Record<number, number> = {}

  private constructor() {}

  static getInstance(): BarbellLoader {
    if (!BarbellLoader.instance) {
      BarbellLoader.instance = new BarbellLoader()
    }
    return BarbellLoader.instance
  }

  loadPlates(newPlates: Record<number, number>) {
    this.platesPerSide = {...this.platesPerSide, ...newPlates}
  }

  unloadPlates() {
    this.platesPerSide = {}
  }

  getPlatesPerSide(): Record<number, number> {
    return this.platesPerSide
  }
}

const Barbell: React.FC<BarbellProps> = ({platesPerSide, barType = "Standard", weightUnit = "lb", barWeight = 45}) => {
  const animatedValues = React.useRef(Object.keys(platesPerSide).map(() => new Animated.Value(0))).current

  React.useEffect(() => {
    Animated.stagger(
      100,
      animatedValues.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      )
    )?.start()
  }, [platesPerSide])

  const renderPlates = (weight: number, index: number) => {
    const numberOfPlates = platesPerSide[weight] || 0
    return Array.from({length: numberOfPlates}).map((_, plateIndex) => (
      <Animated.View key={`${weight}-${plateIndex}`} style={[styles.plate, {backgroundColor: plateColors[weight]}, {transform: [{scale: animatedValues[index]}]}]}>
        <ThemedText>{weight}</ThemedText>
      </Animated.View>
    ))
  }

  const totalWeight =
    Object.keys(platesPerSide).reduce((acc, weight) => {
      const numberOfPlates = platesPerSide[Number(weight)] || 0
      return acc + numberOfPlates * Number(weight) * 2
    }, 0) + barWeight

  //platesPerSide = {"1.25": 0, "10": 0, "15": 1, "2.5": 1, "25": 0, "35": 0, "45": 1, "5": 1}
  const p = React.useMemo(
    () =>
      Object.keys(platesPerSide)
        .map(Number)
        .sort((a, b) => b - a)
        ?.reverse(),
    [platesPerSide]
  )

  return (
    <View style={styles.container}>
      <View style={styles.bar} />
      <View style={styles.platesContainer}>
        {p.map((weight, index) => {
          return <React.Fragment key={weight}>{renderPlates(Number(weight), index)}</React.Fragment>
        })}
      </View>
      <View style={styles.barShort} />
      {/* 
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>{`${barType} Bar`}</ThemedText>
        <ThemedText style={styles.label}>{`Weight Unit: ${weightUnit}`}</ThemedText>
        <ThemedText style={styles.label}>{`Total Weight: ${totalWeight} ${weightUnit}`}</ThemedText>
      </View> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20
  },
  bar: {
    width: 70,
    height: 10,
    backgroundColor: "#34495e" // Wet Asphalt
  },
  barShort: {
    width: 20,
    height: 10,
    backgroundColor: "#34495e" // Wet Asphalt
  },
  platesContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start"
  },
  plate: {
    width: 20,
    height: 100,
    marginHorizontal: 2,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  labelContainer: {
    position: "absolute",
    bottom: -50,
    alignItems: "center"
  },
  label: {
    fontSize: 14,
    color: "#2c3e50" // Midnight Blue
  }
})

export {BarbellLoader}
export default Barbell
