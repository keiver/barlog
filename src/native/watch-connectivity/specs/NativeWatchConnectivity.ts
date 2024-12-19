// src/native/watch-connectivity/specs/NativeWatchConnectivity.ts
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  // Constants
  readonly getConstants: () => {
    WATCH_NUMBER_EVENT: string;
  };

  // Methods
  sendUpdateToWatch(update: {
    weight?: number;
    unit?: string;
    label?: string;
    logs?: string;
  }): Promise<{ status: string }>;

  // Event Emitter Methods
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  "RCTWatchConnectivitySpec"
);
