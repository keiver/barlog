import React, { useCallback } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
  useColorScheme,
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, tintColorLight } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";
import barbellWeights from "@/constants/barbells";
import localStorage from "@/app/libs/localStorage";

interface SettingsBarbellWeightProps {
  onPress: (size: number) => void;
  barbellWeight?: number;
  unit?: string;
}

const SettingsBarbellWeight: React.FC<SettingsBarbellWeightProps> = ({ barbellWeight, onPress, unit }) => {
  const isDark = useColorScheme() === "dark";
  const [isModalVisible, setModalVisible] = React.useState(false);
  const client = localStorage.getInstance();

  const sizes = React.useMemo(() => {
    return barbellWeights?.map((b) => {
      return unit === "kg" ? b.kg : b.lbs;
    });
  }, [unit]);

  const selectedBarbell = barbellWeights?.find((item) => item.lbs === barbellWeight || item.kg === barbellWeight);

  const handleSelect = (size: number) => {
    onPress(size);
    client.storeData("BARBELL_WEIGHT", size.toString());
    setModalVisible(false);
  };

  const renderItem = useCallback(
    ({ item: size }: { item: number }) => {
      const barbell = barbellWeights?.find((b) => b.lbs === size || b.kg === size);
      const isSelected = unit === "kg" ? size === selectedBarbell?.kg : size === selectedBarbell?.lbs;

      return (
        <TouchableOpacity
          onPress={() => handleSelect(size)}
          style={[
            styles.optionCard,
            isSelected && styles.selectedCard,
            isDark && styles.darkCard,
            isDark && isSelected && styles.darkSelectedCard,
          ]}
        >
          <View style={styles.iconContainer}>
            <ThemedText
              lightColor={isSelected ? tintColorLight : "black"}
              darkColor={isSelected ? tintColorLight : "white"}
              style={styles.weight}
            >
              {size} {unit}
            </ThemedText>
            <Ionicons
              name="barbell-sharp"
              size={unit === "kg" ? size * 2 : size}
              color={isSelected ? tintColorLight : isDark ? "white" : "black"}
            />
          </View>
          <View style={styles.textContainer}>
            {barbell?.label && (
              <ThemedText
                type="title"
                lightColor={isSelected ? tintColorLight : "black"}
                darkColor={isSelected ? tintColorLight : "white"}
                style={styles.label}
              >
                {barbell.label}
              </ThemedText>
            )}

            {barbell?.description && (
              <ThemedText
                lightColor={isSelected ? tintColorLight : "black"}
                darkColor={isSelected ? tintColorLight : "white"}
                style={styles.description}
              >
                {barbell.description}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedBarbell, isDark, unit, barbellWeight]
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.optionCard, styles.selectedCard, isDark && styles.darkCard, isDark && styles.darkSelectedCard]}
      >
        <View style={styles.iconContainer}>
          <ThemedText
            lightColor={tintColorLight}
            darkColor={tintColorLight}
            style={styles.weight}
          >
            {unit === "kg" ? selectedBarbell?.kg : selectedBarbell?.lbs} {unit}
          </ThemedText>
          <Ionicons
            name="barbell-sharp"
            size={barbellWeight}
            color={tintColorLight}
          />
        </View>
        <View style={styles.textContainer}>
          {selectedBarbell?.label && (
            <ThemedText
              lightColor={tintColorLight}
              darkColor={tintColorLight}
              style={styles.label}
            >
              {selectedBarbell.label}
            </ThemedText>
          )}

          {selectedBarbell?.description && (
            <ThemedText
              lightColor={tintColorLight}
              darkColor={tintColorLight}
              style={styles.description}
            >
              {selectedBarbell.description}
            </ThemedText>
          )}
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons
            name="chevron-down"
            size={24}
            color={tintColorLight}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
                {/* <View style={styles.modalHeader}>
                  <ThemedText
                    lightColor="black"
                    darkColor="white"
                    style={styles.modalTitle}
                  >
                    Select Barbell
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "white" : "black"}
                    />
                  </TouchableOpacity>
                </View> */}
                <FlatList
                  data={sizes}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={10}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  optionCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 26,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  selectedCard: {
    backgroundColor: Colors.light.maximumTrackTintColor,
    borderColor: tintColorLight,
    borderWidth: 1,
  },
  darkCard: {
    backgroundColor: "#1f2937",
    // borderColor: tintColorDark,
    borderWidth: 1,
  },
  darkSelectedCard: {
    // backgroundColor: "#172554",
  },
  iconContainer: {
    width: "25%",
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  chevronContainer: {
    marginLeft: 8,
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  weight: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    marginTop: 0,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    height: Dimensions.get("window").height * 0.62,
    padding: 25,
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  darkModalContent: {
    backgroundColor: "#1f2937",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
});

export default SettingsBarbellWeight;
