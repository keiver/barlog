import React, { useCallback } from "react";
import { FlatList, Alert, View, StyleSheet, TouchableOpacity, ListRenderItem } from "react-native";
import { ThemedText } from "@/src/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import LogManager from "../libs/LogManager";
import barbellWeights from "../constants/barbells";
import { KG_TO_LB } from "../libs/helpers";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { tintColorDark } from "../constants/Colors";
import * as Haptics from "expo-haptics";

interface BarbellWeight {
  id: string;
  kg: number;
  lbs: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

const LogItem: React.FC<{
  log: WeightLog;
  onClick: (log: WeightLog) => void;
  onDelete: (timestamp: number) => Promise<void>;
  getBarbellWeight: (log: WeightLog) => string;
}> = React.memo(({ log, onDelete, getBarbellWeight, onClick }) => {
  const opacity = useSharedValue(1);
  const height = useSharedValue(88); // Approximate initial height
  const [isDeleting, setIsDeleting] = React.useState(false);
  const handleDelete = React.useCallback(async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      opacity.value = withTiming(0, { duration: 200 });
      height.value = withTiming(0, { duration: 300 });

      await onDelete(log.timestamp);
    } catch (error) {
      setIsDeleting(false);
      opacity.value = withTiming(1);
      height.value = withTiming(88);
    }
  }, [log.timestamp, onDelete, opacity, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: height.value,
  }));

  const weightLabel = React.useMemo(() => {
    if (log.unit === "kg") {
      return `${(log.weight / KG_TO_LB).toFixed(0)}`;
    }

    return `${log.weight}`;
  }, [log]);

  const long = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Plateset", log.plateDescription);
  }, [log.plateDescription]);

  const bar = React.useCallback(() => {
    return (
      <View style={styles.barbellInfo}>
        <ThemedText
          type="small"
          style={styles.barbellText}
        >
          {getBarbellWeight(log)}
        </ThemedText>

        <TabBarIcon
          name="barbell-outline"
          size={18}
        />
      </View>
    );
  }, [getBarbellWeight, log]);

  return (
    <AnimatedView style={[styles.itemContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => onClick(log)}
        disabled={isDeleting}
        onLongPress={long}
      >
        <View style={styles.mainContent}>
          <View style={styles.logHeader}>
            <ThemedText
              type="defaultSemiBold"
              lightColor={tintColorDark}
              darkColor={tintColorDark}
              shadowColor="rgba(0, 0, 0, 0.5)"
              style={styles.weightText}
            >
              {weightLabel} {log.unit}
            </ThemedText>
            {bar()}
          </View>
          <ThemedText
            numberOfLines={1}
            lightColor={"#00FF00"}
            darkColor={"#00FF00"}
            shadowColor="black"
            style={styles.plateDescription}
          >
            {log.plateDescription}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={"white"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedView>
  );
});

export interface WeightLogListProps {
  onItemTapped: (log: WeightLog) => void;
}

const WeightLogList: React.FC<WeightLogListProps> = ({ onItemTapped }) => {
  const [logs, setLogs] = React.useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const logManager = React.useMemo(() => LogManager.getInstance(), []);

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await logManager.initialize();
      setLogs(logManager.getLogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setIsLoading(false);
    }
  }, [logManager]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const deleteLog = React.useCallback(
    async (timestamp: number) => {
      await logManager.deleteLog(timestamp);
      setLogs(logManager.getLogs());
    },
    [logManager]
  );

  const onLogClicked = React.useCallback(
    (log: WeightLog) => {
      onItemTapped?.(log);
    },
    [onItemTapped]
  );

  const getBarbellWeight = React.useCallback((log: WeightLog): string => {
    const bData = barbellWeights.find((b: BarbellWeight) => b.id === log.barbellId);

    if (!bData) {
      return "Unknown barbell";
    }

    return log.unit === "lb" ? `${bData.lbs} lb` : `${bData.kg} kg`;
  }, []);

  const renderItem: ListRenderItem<WeightLog> = React.useCallback(
    ({ item: log }) => (
      <LogItem
        log={log}
        onDelete={deleteLog}
        onClick={onLogClicked}
        getBarbellWeight={getBarbellWeight}
      />
    ),
    [deleteLog, onLogClicked, getBarbellWeight]
  );

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchLogs}
        >
          <ThemedText>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText>Nothing saved</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      keyExtractor={(item) => item.timestamp.toString()}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshing={isLoading}
      onRefresh={fetchLogs}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginHorizontal: 0,
    marginBottom: 0,
    marginRight: 3,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 14,
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    padding: 14,
  },
  logHeader: {
    marginBottom: 4,
  },
  weightText: {
    fontSize: 26,
    marginBottom: 2,
    position: "relative",
    padding: 5,
  },
  barbellText: {
    opacity: 0.7,
  },
  timeText: {
    position: "absolute",
    top: -10,
    right: 0,
    opacity: 0,
  },
  plateDescription: {
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
    marginLeft: 8,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    fontWeight: "400",
  },
  deleteButton: {
    width: 70,
    height: "100%",
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 56,
  },
  separator: {
    height: 22,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    color: "#ff4444",
    marginBottom: 16,
  },
  retryButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
  },
  barbellInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: 85,
    width: "40%",
    height: 25,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    position: "absolute",
    right: 0,
  },
});

export default WeightLogList;
