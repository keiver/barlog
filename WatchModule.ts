import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const WATCH_NUMBER_EVENT = "WatchMessage";

class WatchModule {
  private static instance: WatchModule;
  private eventEmitter: NativeEventEmitter;
  private nativeModule: any;
  private listeners: Set<Function>;
  private isInitialized: boolean;

  private constructor() {
    this.nativeModule = NativeModules.WatchConnectivity;
    this.eventEmitter = new NativeEventEmitter(this.nativeModule);
    this.listeners = new Set();
    this.isInitialized = false;
    this.initialize();
  }

  static getInstance(): WatchModule {
    if (!WatchModule.instance) {
      WatchModule.instance = new WatchModule();
    }
    return WatchModule.instance;
  }

  private initialize() {
    if (this.isInitialized || Platform.OS !== "ios") return;

    console.log("Initializing WatchModule");

    if (!this.nativeModule) {
      console.warn("WatchConnectivity native module not found");
      return;
    }

    this.isInitialized = true;

    // Setup event listener
    this.eventEmitter.addListener(WATCH_NUMBER_EVENT, (event) => {
      console.log("Received watch event:", event);
      this.notifyListeners(event);
    });
  }

  addListener(callback: (event: any) => void): () => void {
    this.listeners.add(callback);
    console.log(`Listener added. Total listeners: ${this.listeners.size}`);

    return () => {
      this.listeners.delete(callback);
      console.log(`Listener removed. Total listeners: ${this.listeners.size}`);
    };
  }

  private notifyListeners(event: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in watch event listener:", error);
      }
    });
  }

  removeAllListeners() {
    this.listeners.clear();
    this.eventEmitter.removeAllListeners(WATCH_NUMBER_EVENT);
    console.log("All watch listeners removed");
  }
}

export default WatchModule.getInstance();
export { WATCH_NUMBER_EVENT };
