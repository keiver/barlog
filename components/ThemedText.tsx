import {Text, type TextProps, StyleSheet} from "react-native"

import {useThemeColor} from "@/hooks/useThemeColor"

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" | "huge"
  shadowColor?: string
}

export function ThemedText({style, lightColor, darkColor, type = "default", shadowColor, ...rest}: ThemedTextProps) {
  const color = useThemeColor({light: lightColor, dark: darkColor}, "text")

  return (
    <Text
      style={[
        {color},
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "huge" ? styles.huge : undefined,
        style,
        shadowColor ? {textShadowColor: shadowColor, textShadowOffset: {width: -2, height: 4}, textShadowRadius: 6} : undefined
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "300"
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600"
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold"
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4"
  },
  huge: {
    lineHeight: 90,
    fontSize: 70,
    fontWeight: "300",
    color: "#e55039",
    shadowColor: "white",
    shadowOffset: {
      width: -2,
      height: 4
    },
    shadowOpacity: 0.25,
    shadowRadius: 6
  }
})
