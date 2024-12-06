import { useState, useEffect } from "react";

class BarbellLoader {
  private static instance: BarbellLoader;
  private platesPerSide: Record<number, number> = {};
  private listeners: Array<() => void> = [];

  private constructor() {}

  static getInstance(): BarbellLoader {
    if (!BarbellLoader.instance) {
      BarbellLoader.instance = new BarbellLoader();
    }
    return BarbellLoader.instance;
  }

  loadPlates(newPlates: Record<number, number>) {
    this.platesPerSide = { ...this.platesPerSide, ...newPlates };
    this.notifyListeners();
  }

  unloadPlates() {
    this.platesPerSide = {};
    this.notifyListeners();
  }

  getPlatesPerSide(): Record<number, number> {
    return this.platesPerSide;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

const usePlateset = () => {
  const [plates, setPlates] = useState<Record<number, number>>({});

  useEffect(() => {
    const barbellLoader = BarbellLoader.getInstance();
    const updatePlates = () => {
      setPlates(barbellLoader.getPlatesPerSide());
    };

    updatePlates();
    barbellLoader.subscribe(updatePlates);

    return () => {
      barbellLoader.unsubscribe(updatePlates);
    };
  }, []);

  const loadPlates = (newPlates: Record<number, number>) => {
    const barbellLoader = BarbellLoader.getInstance();
    barbellLoader.loadPlates(newPlates);
  };

  const unloadPlates = () => {
    const barbellLoader = BarbellLoader.getInstance();
    barbellLoader.unloadPlates();
  };

  return { plates, loadPlates, unloadPlates };
};

export default usePlateset;
