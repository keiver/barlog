import WatchModule, { WatchUpdate, WatchNumberEvent } from "@/WatchModule";
import { EmitterSubscription } from "react-native";

type WatchEventCallback = (weight: number) => void;

class WatchManager {
  private static instance: WatchManager;
  private subscription: EmitterSubscription | { remove: () => void } | null =
    null;
  private isProcessingUpdate = false;
  private lastReceivedWeight: number | null = null;
  private weightUpdateCallback: WatchEventCallback | null = null;
  private updateTimeout: NodeJS.Timeout | null = null;
  private readonly UPDATE_DELAY = 150;

  private constructor() {
    this.setupWatchListener();
  }

  static getInstance(): WatchManager {
    if (!WatchManager.instance) {
      WatchManager.instance = new WatchManager();
    }
    return WatchManager.instance;
  }

  private setupWatchListener(): void {
    if (this.subscription) {
      console.log("Watch listener already setup");
      return;
    }

    console.log("Setting up watch listener...");
    this.subscription = WatchModule.addListener((event: WatchNumberEvent) => {
      if (event.number === undefined) {
        return;
      }

      console.log("Received watch event:", event);
      this.lastReceivedWeight = event.number;

      if (this.weightUpdateCallback) {
        this.weightUpdateCallback(event.number);
      }
    });
  }

  private async processSendUpdate(update: WatchUpdate): Promise<void> {
    try {
      this.isProcessingUpdate = true;
      console.log("Sending update to watch:", update);
      await WatchModule.sendUpdateToWatch(update);
      console.log("Update sent successfully");
    } catch (error) {
      console.warn("Failed to send watch update:", error);
    } finally {
      this.isProcessingUpdate = false;
    }
  }

  public onWeightUpdate(callback: WatchEventCallback): () => void {
    this.weightUpdateCallback = callback;
    return () => {
      this.weightUpdateCallback = null;
    };
  }

  public sendUpdate(update: WatchUpdate): void {
    // Clear any pending update
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    // Schedule new update
    this.updateTimeout = setTimeout(() => {
      this.processSendUpdate(update);
      this.updateTimeout = null;
    }, this.UPDATE_DELAY);
  }

  public cleanup(): void {
    if (this.subscription) {
      console.log("Cleaning up watch listener...");
      this.subscription.remove();
      this.subscription = null;
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    this.weightUpdateCallback = null;
    this.isProcessingUpdate = false;
    this.lastReceivedWeight = null;
  }

  public isProcessing(): boolean {
    return this.isProcessingUpdate;
  }
}

export default WatchManager;
