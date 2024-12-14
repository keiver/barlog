import AsyncStorage from "@react-native-async-storage/async-storage";

export class LogManager {
  private static instance: LogManager;
  private readonly STORAGE_KEY = "weight_logs";
  private readonly MAX_LOGS = 100;
  private logs: WeightLog[] = [];
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedLogs = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize logs:", error);
      this.logs = [];
    }
  }

  public async addLog(log: Omit<WeightLog, "timestamp">): Promise<void> {
    // Ensure initialization
    if (!this.initialized) {
      await this.initialize();
    }

    const newLog: WeightLog = {
      ...log,
      timestamp: Date.now(),
    };

    // Get the latest log and check for duplicate
    const lastLog = this.getLatestLog();
    console.log("Last weight:", lastLog?.weight, "New weight:", newLog.weight);

    if (lastLog && lastLog.weight === newLog.weight) {
      console.log("Skipping duplicate weight");
      return;
    }

    // Add new log at the beginning of the array
    this.logs.unshift(newLog);

    // Trim logs if we exceed maximum
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error("Failed to save logs:", error);
    }
  }

  public getLogs(): WeightLog[] {
    return this.logs;
  }

  public async clearLogs(): Promise<void> {
    this.logs = [];
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  public getLatestLog(): WeightLog | null {
    return this.logs[0] || null;
  }

  public async deleteLog(timestamp: number): Promise<void> {
    this.logs = this.logs.filter((log) => log.timestamp !== timestamp);
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error("Failed to save logs after deletion:", error);
    }
  }

  public getLogsByDate(date: Date): WeightLog[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfDay && logDate <= endOfDay;
    });
  }
}

export default LogManager;
