import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { BlurView } from "expo-blur";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useColorScheme } from "react-native";
import { tintColorLight } from "@/constants/Colors";
import ParallaxScrollView from "./ParallaxScrollView";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  // buttonLabel = "Save",
  onButtonPress,
}) => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === "dark" ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)";
  const closeIconColor = colorScheme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)";

  return (
    <Modal
      animationType="slide"
      hardwareAccelerated={true}
      statusBarTranslucent={true}
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <ImageBackground style={styles.centeredView}>
          <BlurView
            intensity={50}
            tint="default"
            style={[styles.modalView, { backgroundColor }]}
          >
            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={onButtonPress || onClose}
            >
              <TabBarIcon
                name="close"
                color={closeIconColor}
              />
            </TouchableOpacity>
            <ParallaxScrollView style={styles.scrollView}>
              <React.Fragment>
                <View style={styles.modalContent}>{children}</View>
              </React.Fragment>
            </ParallaxScrollView>
          </BlurView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // elevation: 5,
    overflow: "hidden",
    maxHeight: Dimensions.get("window").height * 0.45,
    height: "100%",
    width: Dimensions.get("window").width * 0.9,
  },
  modalTitle: {
    paddingTop: 10,
    marginTop: 5,
    textAlign: "left",
    fontWeight: "400",
    fontSize: 28,
  },
  modalCloseIcon: {
    position: "absolute",
    top: 34,
    right: 34,
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
    // color: "white",
    fontWeight: "bold",
    textAlign: "center",
    color: "#151718",
    // textTransform: "uppercase",
  },
  scrollView: {
    flex: 1,
    padding: 0,
    backgroundColor: "transparent",
  },
});

export default CustomModal;
