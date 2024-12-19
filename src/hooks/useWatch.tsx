import { useEffect, useRef, useCallback } from "react";
import WatchModule, { WatchUpdate, WatchNumberEvent } from "@/WatchModule";
import { EmitterSubscription } from "react-native";

interface UseWatchConfig {
  onNumberReceived?: (number: number) => void;
  enabled?: boolean;
}

interface WatchState {
  sendUpdate: (update: WatchUpdate) => void;
}

export function useWatch({ onNumberReceived, enabled = true }: UseWatchConfig): WatchState {
  const subscription = useRef<EmitterSubscription | { remove: () => void }>();
  const isUserInteraction = useRef(false);

  // Initialize watch listener
  useEffect(() => {
    if (!enabled) return;

    subscription.current = WatchModule.addListener((event: WatchNumberEvent) => {
      if (!event.number) return;

      // Only process watch events if they came from user interaction
      if (!isUserInteraction.current) {
        onNumberReceived?.(event.number);
      }
    });

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, [enabled, onNumberReceived]);

  const sendUpdate = useCallback(
    (update: WatchUpdate) => {
      if (!enabled) return;

      isUserInteraction.current = true;
      console.log("Sending update to watch", update);
      WatchModule.sendUpdateToWatch(update).finally(() => {
        isUserInteraction.current = false;
      });
    },
    [enabled]
  );

  return { sendUpdate };
}
