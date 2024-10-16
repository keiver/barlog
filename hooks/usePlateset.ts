import {useState, useEffect} from "react"

class BarbellLoader {
  private static instance: BarbellLoader
  private platesPerSide: Record<number, number> = {}

  private constructor() {}

  static getInstance(): BarbellLoader {
    if (!BarbellLoader.instance) {
      BarbellLoader.instance = new BarbellLoader()
    }
    return BarbellLoader.instance
  }

  loadPlates(newPlates: Record<number, number>) {
    this.platesPerSide = {...this.platesPerSide, ...newPlates}
  }

  unloadPlates() {
    this.platesPerSide = {}
  }

  getPlatesPerSide(): Record<number, number> {
    return this.platesPerSide
  }
}

const usePlateset = () => {
  const [plates, setPlates] = useState<Record<number, number>>({})

  useEffect(() => {
    const barbellLoader = BarbellLoader.getInstance()
    setPlates(barbellLoader.getPlatesPerSide())
  }, [])

  const loadPlates = (newPlates: Record<number, number>) => {
    const barbellLoader = BarbellLoader.getInstance()
    barbellLoader.loadPlates(newPlates)
    setPlates(barbellLoader.getPlatesPerSide())
  }

  const unloadPlates = () => {
    const barbellLoader = BarbellLoader.getInstance()
    barbellLoader.unloadPlates()
    setPlates(barbellLoader.getPlatesPerSide())
  }

  return {plates, loadPlates, unloadPlates}
}

export default usePlateset
