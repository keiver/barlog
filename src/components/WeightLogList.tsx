import React from "react";
import { FlatList, View, StyleSheet, TouchableOpacity, ListRenderItem, useColorScheme } from "react-native";
import { ThemedText } from "@/src/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import LogManager from "../libs/LogManager";
import barbellWeights from "../constants/barbells";
import { KG_TO_LB } from "../libs/helpers";

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
  const theme = useColorScheme();
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

  const w = React.useMemo(() => {
    if (log.unit === "kg") {
      return `${(log.weight / KG_TO_LB).toFixed(0)}`;
    }

    return `${log.weight}`;
  }, [log]);

  return (
    <AnimatedView style={[styles.itemContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => onClick(log)}
        disabled={isDeleting}
      >
        <View style={styles.mainContent}>
          <View style={styles.logHeader}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.weightText}
            >
              {w}
              {log.unit}
              <ThemedText
                type="small"
                style={styles.barbellText}
              >
                {" "}
                ({getBarbellWeight(log)} Barbell)
              </ThemedText>
            </ThemedText>

            <ThemedText
              type="small"
              style={styles.timeText}
            >
              {" "}
              {new Date(log.timestamp).toLocaleString()}
            </ThemedText>
            <View style={styles.barbellInfo}></View>
          </View>
          <ThemedText
            numberOfLines={1}
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
            color={theme === "dark" ? "white" : "black"}
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

    return log.unit === "lb" ? `${bData.lbs}lb` : `${bData.kg}kg`;
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
        <ThemedText>No target weights saved</ThemedText>
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  logHeader: {
    marginBottom: 4,
  },
  weightText: {
    fontSize: 18,
    marginBottom: 2,
  },
  barbellInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barbellText: {
    opacity: 0.7,
    transform: [{ translateY: 15 }],
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
    height: 28,
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
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
  },
});

export default WeightLogList;
