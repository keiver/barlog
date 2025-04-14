import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  readonly getConstants: () => {
    WATCH_NUMBER_EVENT: string;
  };

  sendUpdateToWatch(update: {
    weight?: number;
    unit?: string;
    label?: string;
    logs?: string;
  }): Promise<{ status: string }>;

  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  "RCTWatchConnectivitySpec"
);
