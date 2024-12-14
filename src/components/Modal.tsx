import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
  AccessibilityInfo,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useColorScheme } from "react-native";

import { tintColorLight } from "@/src/constants/Colors";
import ParallaxScrollView from "./ParallaxScrollView";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttonLabel?: string;
  onButtonPress?: () => void;
  description?: string;
  version?: boolean;
  animationType?: "slide" | "fade";
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  version = true,
  title,
  children,
  onButtonPress,
  description,
  animationType = "slide",
}) => {
  const colorScheme = useColorScheme();
  const versionFile = require("../../app.json");
  const backgroundColor = colorScheme === "dark" ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.5)";
  const closeIconColor = colorScheme === "dark" ? "#fff" : "#000";
  const c = version ? `v${versionFile.expo.version}` || "0.0.0" : "";
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check if the user has enabled "Reduce Motion"
    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      setReduceMotionEnabled(isEnabled);
    });

    // Listen for changes in the "Reduce Motion" setting
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (isEnabled) => {
      setReduceMotionEnabled(isEnabled);
    });

    return () => {
      // Clean up the subscription when the component unmounts
      subscription?.remove();
    };
  }, []);

  return (
    <Modal
      animationType={reduceMotionEnabled ? "none" : animationType}
      hardwareAccelerated={true}
      statusBarTranslucent={true}
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <ImageBackground style={styles.centeredView}>
          <BlurView
            intensity={99}
            style={[styles.modalView, { backgroundColor }]}
          >
            <ThemedText style={styles.modalTitle}>
              {title}
              <ThemedText type="small"> {c}</ThemedText>
            </ThemedText>

            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={onButtonPress || onClose}
              hitSlop={50}
            >
              <TabBarIcon
                name="close"
                color={closeIconColor}
              />
            </TouchableOpacity>
            {description && <ThemedText>{description}</ThemedText>}
            <View style={styles.modalContent}>{children}</View>
          </BlurView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    overflow: "hidden",
  },
  modalView: {
    position: "relative",
    padding: 25,
    paddingTop: 14,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: "hidden",
    height: height * 0.75 < 480 ? height * 0.75 : 480,
    width: width * 0.9,
    backgroundColor: "transparent",
  },
  modalTitle: {
    paddingTop: 10,
    marginTop: 5,
    marginBottom: 15,
    textAlign: "left",
    fontWeight: "400",
    fontSize: 24,
  },
  modalCloseIcon: {
    position: "absolute",
    top: 22,
    right: 28,
    paddingTop: 5,
  },
  modalContent: {
    marginBottom: 20,
  },
  button: {
    position: "absolute",
    bottom: 35,
    right: 38,
    backgroundColor: tintColorLight,
    fontSize: 40,
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    elevation: 2,
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#151718",
  },
  scrollView: {
    flex: 1,
    padding: 0,
    backgroundColor: "transparent",
  },
});

export default CustomModal;
