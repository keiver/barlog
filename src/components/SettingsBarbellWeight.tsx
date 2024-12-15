import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet, View, useColorScheme, Dimensions, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Modal from "./Modal";

import { Colors, tintColorDark, tintColorLight } from "@/src/constants/Colors";
import barbellWeights from "@/src/constants/barbells";
import localStorage from "@/src/libs/localStorage";
import { keys } from "@/src/constants/Storage";

import { ThemedText } from "./ThemedText";
import ParallaxScrollView from "./ParallaxScrollView";

interface SettingsBarbellWeightProps {
  onPress: (size: string) => void;
  barbellId?: string;
  unit?: string;
}

const SettingsBarbellWeight: React.FC<SettingsBarbellWeightProps> = ({ barbellId, onPress, unit }) => {
  const colorScheme = useColorScheme();
  const isDark = useColorScheme() === "dark";
  const [isModalVisible, setModalVisible] = React.useState(false);
  const client = localStorage.getInstance();
  const bg = colorScheme === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.2)";

  const sizes = React.useMemo(() => {
    return barbellWeights?.map((b) => {
      return b?.id;
    });
  }, [unit]);

  const selectedBarbell = barbellWeights?.find((item) => item.id === barbellId);

  const handleSelect = (id: string) => {
    onPress(id);

    const barbell = barbellWeights?.find((b) => b.id === id);

    if (!barbell) {
      return;
    }

    client.storeData(keys.BARBELL_ID, barbell?.id?.toString() || "");
    setModalVisible(false);
  };

  const renderItem = useCallback(
    ({ item: id }: { item: string }) => {
      const barbell = barbellWeights.find((b) => b.id === id);
      const isSelected = selectedBarbell?.id === id;

      if (!barbell) {
        return null;
      }

      return (
        <TouchableOpacity
          key={id}
          onPress={() => handleSelect(id)}
          style={[
            styles.optionCard,
            isSelected && styles.selectedCard,
            {
              backgroundColor: isSelected ? "rgba(0,0,0,.8)" : bg,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <ThemedText
              lightColor={isSelected ? tintColorLight : "#000"}
              darkColor={isSelected ? tintColorLight : "#fff"}
              style={styles.weight}
            >
              {unit === "kg" ? barbell.kg : barbell.lbs} {unit}
            </ThemedText>
            <Ionicons
              name="barbell-sharp"
              size={(barbell?.kg || 0) * 2.2}
              color={isSelected ? tintColorLight : isDark ? "rgba(255,2555,255,.2)" : "rgba(0,0,0,.9)"}
            />
          </View>
          <View style={styles.textContainer}>
            {barbell.label && (
              <ThemedText
                type="title"
                lightColor={isSelected ? tintColorLight : "#000"}
                darkColor={isSelected ? tintColorLight : "#fff"}
                style={styles.label}
              >
                {barbell.label}
              </ThemedText>
            )}
            {barbell.description && (
              <ThemedText
                lightColor={isSelected ? tintColorLight : "#000"}
                darkColor={isSelected ? tintColorLight : "#fff"}
                style={styles.description}
              >
                {barbell.description}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedBarbell, isDark, unit]
  );

  const sorted = React.useMemo(() => {
    // selectedBarbell is always first
    const filtered = sizes?.filter((size) => size !== barbellId);
    return [barbellId, ...filtered];
  }, [sizes, barbellId]);

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
            size={unit === "kg" ? (selectedBarbell?.kg || 0) * 2.2 : selectedBarbell?.lbs || 0}
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
              numberOfLines={2}
            >
              {selectedBarbell.description}
            </ThemedText>
          )}
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={tintColorLight}
          />
        </View>
      </TouchableOpacity>

      <Modal
        title="Select Barbell"
        isVisible={isModalVisible}
        version={false}
        onClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent]}>
            <ParallaxScrollView style={styles.scrollView}>
              <View>{sorted.map((item: any) => renderItem({ item }))}</View>
            </ParallaxScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  optionCard: {
    flexDirection: "row",
    borderRadius: 26,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 0,
  },
  selectedCard: {
    backgroundColor: Colors.light.maximumTrackTintColor,
    borderColor: tintColorDark,
    borderWidth: 4,
  },
  darkCard: {
    backgroundColor: "#ff",
    borderWidth: 1,
  },
  darkSelectedCard: {},
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
    marginLeft: 5,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    padding: 0,
    backgroundColor: "transparent",
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
    width: "100%",
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    height: height * 0.6 < 445 ? height * 0.67 : 445,
    padding: 0,
    transform: [{ translateY: 10 }],
    width: "100%",
    backgroundColor: "#FF",
    borderRadius: 0,
    paddingBottom: 40,
    overflow: "hidden",
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
