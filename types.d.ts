declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

/**
 * Represents a set of weight plates, where:
 * - The key is the weight of a single plate (e.g., 45 for a 45lb plate)
 * - The value is the number of plates of that weight to use per side
 *
 * Example: { 45: 2, 25: 1 } means two 45lb plates and one 25lb plate per side
 */
type PlateSet = {
  [key: number]: number;
};
/**
 * Valid weight units
 */
type Unit = "lb" | "kg";

interface WeightLog {
  timestamp: number;
  weight: number;
  unit: Unit;
  barbellId: string;
  plateDescription: string;
  timestamp?: number;
}
