import React, { useEffect, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  BackHandler,
  Modal,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { ThemedText } from "./ThemedText";
import { useColorScheme } from "react-native";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttonLabel?: string;
  onButtonPress?: () => void;
  description?: string;
  version?: boolean;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  version = true,
  title,
  children,
  onButtonPress,
  description,
}) => {
  const colorScheme = useColorScheme();
  const versionFile = require("../../app.json");
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (isVisible) {
          onClose();
          return true;
        }
        return false;
      });
      return () => backHandler.remove();
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: reduceMotionEnabled ? 0 : 200 });
      scale.value = withTiming(1, { duration: reduceMotionEnabled ? 0 : 300 });
    } else {
      opacity.value = withTiming(0, { duration: reduceMotionEnabled ? 0 : 200 });
      scale.value = withTiming(0.95, { duration: reduceMotionEnabled ? 0 : 200 });
    }
  }, [isVisible, reduceMotionEnabled]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backgroundColor = colorScheme === "dark" ? "#000" : "rgba(255,255,255,.9)";
  const closeIconColor = colorScheme === "dark" ? "#fff" : "#000";
  const version_string = version ? `v${versionFile.expo.version}` || "0.0.0" : "";

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["portrait"]}
    >
      <View style={styles.centeredView}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.modalContainer, contentStyle]}>
            <AnimatedBlurView
              intensity={99}
              experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
              style={[styles.blurContainer, { backgroundColor }]}
            >
              <View style={styles.header}>
                <ThemedText style={styles.title}>
                  {title}
                  <ThemedText type="small"> {version_string}</ThemedText>
                </ThemedText>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
                  accessible={true}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <TabBarIcon
                    name="close"
                    color={closeIconColor}
                  />
                </TouchableOpacity>
              </View>

              {description && <ThemedText style={styles.description}>{description}</ThemedText>}

              <View style={styles.content}>{children}</View>
            </AnimatedBlurView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 223,
    elevation: 223,
  },
  overlay: {
    height,
    paddingTop: height / 2 - 225,
    backgroundColor: "rgba(0,0,0,.1)",
    zIndex: 222,
    elevation: 222,
  },
  modalContainer: {
    width: Dimensions.get("window").width - 40,
    marginHorizontal: 20,
    height: Math.min(height * 0.8, 500),
    borderRadius: 20,
    overflow: "hidden",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    padding: 25,
    paddingTop: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  title: {
    paddingTop: 10,
    marginTop: 5,
    fontSize: 24,
    fontWeight: "400",
    flex: 1,
    marginRight: 40,
  },
  closeButton: {
    padding: 5,
    marginTop: 15,
    marginRight: -5,
  },
  description: {
    marginBottom: 15,
  },
  content: {
    flex: 1,
  },
});

export default CustomModal;
