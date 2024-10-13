import React, {useEffect, useCallback} from "react"
import {Image, StyleSheet, Platform, SafeAreaView} from "react-native"

import {HelloWave} from "@/components/HelloWave"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import {ThemedText} from "@/components/ThemedText"
import {ThemedView} from "@/components/ThemedView"
import Slider from "@/components/Slider"
import Barbell, {BarbellLoader} from "@/components/Bar"

export type PlateSet = Record<number, number>

const samplePlateSet: PlateSet = {
  45: 0,
  35: 0,
  25: 0,
  15: 0,
  10: 0,
  5: 0,
  2.5: 0,
  1.25: 0
}

const barbellWeight = 45 // Barbell weight in pounds

export default function HomeScreen() {
  const barbellLoader = BarbellLoader.getInstance()
  const [plates, setPlates] = React.useState<PlateSet>({...samplePlateSet})
  const [lastCallTime, setLastCallTime] = React.useState<number | null>(null)

  useEffect(() => {
    barbellLoader.loadPlates(plates)

    return () => {
      barbellLoader.unloadPlates()
    }
  }, [plates])

  const calculatePlates = (targetWeight: number): PlateSet => {
    if (targetWeight < barbellWeight) {
      console.warn("Target weight is less than the barbell weight")
      return {...samplePlateSet}
    }

    // Subtract the barbell weight from the target weight to determine the total weight for plates
    let remainingWeight = (targetWeight - barbellWeight) / 2 // divide by 2 as we calculate for one side
    const availablePlates = [45, 35, 25, 15, 10, 5, 2.5, 1.25]
    const newPlates: PlateSet = {...samplePlateSet}

    for (let i = 0; i < availablePlates.length; i++) {
      const plate = availablePlates[i]
      const count = Math.floor(remainingWeight / plate)
      if (count > 0) {
        newPlates[plate] = count
        remainingWeight -= plate * count
        remainingWeight = parseFloat(remainingWeight.toFixed(2)) // Fix floating-point precision issues
      }
    }

    return newPlates
  }

  const throttle = (func: (value: number) => void, limit: number) => {
    return (value: number) => {
      const now = Date.now()
      if (!lastCallTime || now - lastCallTime >= limit) {
        setLastCallTime(now)
        func(value)
      }
    }
  }

  const handleScrollValue = (value: number) => {
    const newPlates = calculatePlates(value)
    setPlates(newPlates)
    barbellLoader.loadPlates(newPlates)
  }

  const throttledGetScrollValue = useCallback(throttle(handleScrollValue, 400), [lastCallTime])

  return (
    <ThemedView style={styles.container}>
      <Slider onValueChanged={throttledGetScrollValue} />
      <Barbell platesPerSide={plates} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8
  },
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 64
  },
  header: {
    height: 250,
    overflow: "hidden"
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden"
  }
})
