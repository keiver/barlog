// src/native/watch-connectivity/WatchModule.ts
import { Platform, NativeEventEmitter } from "react-native";
import type { Spec } from "./src/native/watch-connectivity/specs/NativeWatchConnectivity";
import { TurboModuleRegistry } from "react-native";

interface WatchNumberEvent {
  number: number;
}

interface WatchUpdate {
  weight?: number;
  unit?: string;
  label?: string;
  logs?: string;
}

// Retrieve the TurboModule instance
const watchModule = TurboModuleRegistry.getEnforcing<Spec>(
  "RCTWatchConnectivitySpec"
);

// Create an event emitter for the TurboModule
const watchEventEmitter = new NativeEventEmitter(watchModule);

// Extract constants from the TurboModule
const { WATCH_NUMBER_EVENT } = watchModule.getConstants();

const WatchModule = {
  addListener: (callback: (event: WatchNumberEvent) => void) => {
    // If for some reason the module isn't available, mimic the old behavior:
    if (!watchModule) {
      console.warn("Watch connectivity not available");
      return { remove: () => {} };
    }

    // Add a listener using NativeEventEmitter, returns EmitterSubscription
    // which has a `.remove()` method for backward compatibility
    const subscription = watchEventEmitter.addListener(
      WATCH_NUMBER_EVENT,
      (event) => {
        callback(event);
      }
    );

    return subscription;
  },

  sendUpdateToWatch: async (update: WatchUpdate): Promise<any> => {
    if (!watchModule) {
      throw new Error("Watch connectivity not available");
    }

    if (Platform.OS !== "ios") {
      throw new Error("Watch connectivity is only available on iOS");
    }

    console.log("Sending update to watch:", update);

    try {
      const response = await watchModule.sendUpdateToWatch(update);
      console.log("Watch update response:", response);
      return response;
    } catch (error) {
      console.error("Failed to send update to watch:", error);
      throw error;
    }
  },

  removeAllListeners: () => {
    // Matches the old behavior of removing all listeners for the event
    watchEventEmitter.removeAllListeners(WATCH_NUMBER_EVENT);
  },
};

export default WatchModule;
export { WATCH_NUMBER_EVENT, type WatchUpdate, type WatchNumberEvent };
