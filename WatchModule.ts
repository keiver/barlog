import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const WATCH_NUMBER_EVENT = "WatchReceiveMessage";

// Get the native module
const watchModule = NativeModules.RCTWatchConnectivity;

// Create event emitter instance
const watchEventEmitter = new NativeEventEmitter(watchModule);

interface WatchNumberEvent {
  number: number;
}

interface WatchUpdate {
  weight?: number;
  unit?: string;
  label?: string;
  logs?: string;
}

const WatchModule = {
  addListener: (callback: (event: WatchNumberEvent) => void) => {
    if (!watchModule) {
      console.warn("Watch connectivity not available");
      return { remove: () => {} };
    }

    console.log("Adding watch number listener");
    return watchEventEmitter.addListener(WATCH_NUMBER_EVENT, (event) => {
      console.log("Received watch event:", event);
      callback(event);
    });
  },

  sendUpdateToWatch: async (update: WatchUpdate): Promise<any> => {
    if (!watchModule) {
      throw new Error("Watch connectivity not available");
    }

    if (Platform.OS !== "ios") {
      throw new Error("Watch connectivity is only available on iOS");
    }

    try {
      console.log("Sending update to watch:", update);
      const response = await watchModule.sendUpdateToWatch(update);
      console.log("Watch update response:", response);
      return response;
    } catch (error) {
      console.error("Failed to send update to watch:", error);
      throw error;
    }
  },

  removeAllListeners: () => {
    if (watchModule) {
      watchEventEmitter.removeAllListeners(WATCH_NUMBER_EVENT);
    }
  },
};

export default WatchModule;
export { WATCH_NUMBER_EVENT, type WatchUpdate, type WatchNumberEvent };
