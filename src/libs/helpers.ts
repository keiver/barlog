import barbellWeights from "@/src/constants/barbells";

// Constants
export const KG_TO_LB = 2.20462262;
export const LB_TO_KG = 0.453592;

// Consolidate all unit-specific constants
export const UNITS: Record<
  Unit,
  {
    plates: number[];
    convert: (weight: number) => number;
    format: (weight: number) => string;
  }
> = {
  kg: {
    plates: [20.4, 15.9, 11.3, 6.8, 4.5, 2.3, 1.13],
    convert: (weight: number) => weight * LB_TO_KG,
    format: (weight: number) => {
      if (weight % 1 === 0) return weight.toFixed(0);
      // For weights under 2kg, show 2 decimal places
      if (weight < 2) return weight.toFixed(2);
      return weight.toFixed(1);
    },
  },
  lb: {
    plates: [45, 35, 25, 15, 10, 5, 2.5],
    convert: (weight: number) => weight / LB_TO_KG,
    format: (weight: number) =>
      weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1),
  },
};

// Simplified conversion functions
export function convert(weight: number, unit: Unit, digits = 0): string {
  return unit === "kg"
    ? (weight * LB_TO_KG).toFixed(digits)
    : Math.round(weight).toString();
}

export const convertToKg = (weight: number, unit: Unit): number =>
  unit === "kg" ? weight : weight * LB_TO_KG;

export const convertToLb = (weight: number, unit: Unit): string =>
  unit === "lb" ? `${weight}` : Math.round(weight / LB_TO_KG).toFixed(0);

export function findMatchingById(
  id: string
): (typeof barbellWeights)[0] | undefined {
  return barbellWeights.find((bb) => bb.id === id);
}

export function findMatchingBarbell(
  weight: number,
  unit: Unit
): (typeof barbellWeights)[0] | undefined {
  return barbellWeights.find((bb) => {
    const bbWeight = unit === "kg" ? bb.kg : bb.lbs;
    return Math.abs(bbWeight - weight) < 0.1;
  });
}

export function calculatePlates(
  targetWeight: number,
  barbellWeight: number,
  unit: Unit
): PlateSet {
  const result: PlateSet = {};
  const plates = UNITS[unit].plates;

  // Initialize all plates to 0 - ONLY for plates in our valid array
  plates.forEach((weight) => (result[weight] = 0));

  // Convert weights to working unit
  const barbellInLbs = unit === "kg" ? barbellWeight * KG_TO_LB : barbellWeight;
  let weightPerSide = (targetWeight - barbellInLbs) / 2;

  // Convert to kg if needed
  if (unit === "kg") {
    weightPerSide *= LB_TO_KG;
  }

  if (weightPerSide <= 0) return result;

  // Calculate plates needed
  let remaining = weightPerSide;

  for (const plateWeight of plates) {
    if (remaining >= plateWeight) {
      const count = Math.floor(remaining / plateWeight);
      result[plateWeight] = count;
      remaining -= plateWeight * count;
    }
  }

  return result;
}

// From helpers.ts
export function describePlateSet(plateSet: PlateSet, unit: Unit): string {
  // Only consider plates that are in our valid plates array
  const validPlates = UNITS[unit].plates;
  const entries = Object.entries(plateSet)
    .filter(
      ([weight, count]) => count > 0 && validPlates.includes(parseFloat(weight))
    )
    .sort(([a], [b]) => parseFloat(b) - parseFloat(a));

  if (entries.length === 0) return "0 Plates ";

  return entries
    .map(([weight, count]) => {
      const wNum = parseFloat(weight);
      return `${count} × ${UNITS[unit].format(wNum)} ${unit}`;
    })
    .join(" 🔘 ");
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
