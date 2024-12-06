import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { transform } from "@babel/core";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" | "huge" | "label" | "small";
  shadowColor?: string;
  vertical?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  shadowColor,
  vertical,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "huge" ? styles.huge : undefined,
        type === "label" ? styles.label : undefined,
        type === "small" ? styles.small : undefined,
        vertical ? styles.vertical : undefined,

        style,
        shadowColor
          ? { textShadowColor: shadowColor, textShadowOffset: { width: -2, height: 4 }, textShadowRadius: 6 }
          : undefined,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "300",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
  small: {
    fontSize: 8,
  },
  label: {
    lineHeight: 40,
    fontWeight: "500",
    fontSize: 18,
    marginBottom: 15,
    marginTop: 15,
  },
  huge: {
    lineHeight: 90,
    fontSize: 70,
    fontWeight: "300",
    color: "#e55039",
    shadowColor: "white",
    shadowOffset: {
      width: -2,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  vertical: {
    transform: [{ rotate: "90deg" }],
  },
});
