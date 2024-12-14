import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  AccessibilityInfo,
  Platform,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";
import { TabBarIcon } from "./navigation/TabBarIcon";
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
  const backgroundColor = colorScheme === "dark" ? "rgba(0,0,0,.9)" : "rgba(255,255,255,.9)";
  const closeIconColor = colorScheme === "dark" ? "#fff" : "#000";
  const c = version ? `v${versionFile.expo.version}` || "0.0.0" : "";
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      setReduceMotionEnabled(isEnabled);
    });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (isEnabled) => {
      setReduceMotionEnabled(isEnabled);
    });

    return () => {
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
        <View style={styles.centeredView}>
          <BlurView
            intensity={99}
            tint={colorScheme === "dark" ? "dark" : "light"}
            experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
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
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalView: {
    position: "relative",
    padding: 25,
    paddingTop: 14,
    borderRadius: 20,
    overflow: "hidden",
    height: height * 0.75 < 480 ? height * 0.75 : 480,
    width: width * 0.9,
    backgroundColor: "transparent",
    ...Platform.select({
      android: {
        elevation: 24,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
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
    zIndex: 1,
  },
  modalContent: {
    marginBottom: 20,
  },
});

export default CustomModal;
