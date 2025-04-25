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

// Try retrieving the TurboModule instance safely
const watchModule =
  TurboModuleRegistry.get<Spec>("RCTWatchConnectivitySpec") ?? null;

// Create an event emitter for the TurboModule if it exists
const watchEventEmitter = watchModule
  ? new NativeEventEmitter(watchModule)
  : null;

// Extract constants safely
const WATCH_NUMBER_EVENT =
  watchModule?.getConstants?.().WATCH_NUMBER_EVENT ?? "WATCH_NUMBER_EVENT";

const WatchModule = {
  addListener: (callback: (event: WatchNumberEvent) => void) => {
    if (!watchEventEmitter) {
      console.warn("Watch connectivity not available, listener not added.");
      return { remove: () => {} };
    }

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
      console.warn("Watch connectivity not available.");
      return;
    }

    if (Platform.OS !== "ios") {
      console.warn("Watch connectivity only available on iOS.");
      return;
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
    if (!watchEventEmitter) {
      console.warn("Watch connectivity not available, no listeners to remove.");
      return;
    }
    watchEventEmitter.removeAllListeners(WATCH_NUMBER_EVENT);
  },
};

export default WatchModule;
export { WATCH_NUMBER_EVENT, type WatchUpdate, type WatchNumberEvent };
