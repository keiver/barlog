// src/hooks/useAccessibility.ts
import { AccessibilityProps } from "react-native";

type A11yOptions = {
  label: string;
  role?: AccessibilityProps["accessibilityRole"];
  hint?: string;
  liveRegion?: AccessibilityProps["accessibilityLiveRegion"];
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
};

export function useAccessibility({
  label,
  role,
  hint,
  liveRegion,
  value,
}: A11yOptions): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: role,
    accessibilityHint: hint,
    accessibilityLiveRegion: liveRegion,
    accessibilityValue: value,
  };
}
