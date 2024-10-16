import React from "react"
import {TouchableOpacity, StyleSheet, ViewStyle} from "react-native"
import {TabBarIcon} from "./navigation/TabBarIcon"

export type ThemedButtonProps = {
  onPress: () => void
  size?: number
  iconColor?: string
  borderColor?: string
  backgroundColor?: string
  style?: ViewStyle
}

export function ThemedRoundButton({onPress, size = 70, iconColor = "white", borderColor = "orange", backgroundColor = "orange", style}: ThemedButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor,
          borderColor: borderColor
        },
        style
      ]}
    >
      <TabBarIcon name="settings" size={size / 2} color={iconColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 88,
    right: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    padding: 10
  }
})
