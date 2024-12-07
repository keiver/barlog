import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const WATCH_NUMBER_EVENT = "WatchReceiveMessage"; // Match native event name

const watchModule = NativeModules.WatchConnectivity;

if (Platform.OS === "ios" && !watchModule) {
  console.error(
    "WatchConnectivity native module is not available. Make sure it is properly linked."
  );
}

// Create a safe module object with required methods
const safeWatchModule = watchModule || {
  addListener: () => {},
  removeListeners: () => {},
  supportedEvents: () => [WATCH_NUMBER_EVENT],
};

export const watchEventEmitter = new NativeEventEmitter(safeWatchModule);

const WatchModule = {
  addListener: (callback: (data: { number: number }) => void) => {
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

  removeAllListeners: () => {
    if (watchModule) {
      watchEventEmitter.removeAllListeners(WATCH_NUMBER_EVENT);
    }
  },
};

export default WatchModule;
export { WATCH_NUMBER_EVENT };
