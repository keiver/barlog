import AsyncStorage from "@react-native-async-storage/async-storage";

export default class AsyncStorageClient {
  private static instance: AsyncStorageClient;

  private constructor() {}

  public static getInstance(): AsyncStorageClient {
    if (!AsyncStorageClient.instance) {
      AsyncStorageClient.instance = new AsyncStorageClient();
    }
    return AsyncStorageClient.instance;
  }

  // Save data
  public async storeData(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  }

  // Get data
  public async getData(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        console.log("Stored value:", value);
        return value;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return null;
    }
  }
}

// Usage

// const storageClient = AsyncStorageClient.getInstance();

// (async () => {
//   await storageClient.storeData("exampleKey", "exampleValue");
//   const storedValue = await storageClient.getData("exampleKey");
//   console.log(storedValue);
// })();
