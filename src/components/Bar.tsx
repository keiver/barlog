import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Pattern, Path, G, Rect, Use } from "react-native-svg";

// PlateSet type definition
interface PlateSet {
  [weight: number]: number; // weight in lbs/kg -> count
}

type Unit = "kg" | "lb";

interface BarbellProps {
  platesPerSide: PlateSet;
  barType?: "olympic" | "standard";
  unit?: Unit;
  barWeight?: number;
  width?: number;
  height?: number;
}

// Static weight conversion maps
const kgToLbMap: Record<number, number> = {
  20.4: 45,
  15.9: 35,
  11.3: 25,
  6.8: 15,
  4.5: 10,
  2.3: 5,
  1.13: 2.5,
};

const lbToKgMap: Record<number, number> = {
  45: 20.4,
  35: 15.9,
  25: 11.3,
  15: 6.8,
  10: 4.5,
  5: 2.3,
  2.5: 1.13,
};

// Colors for different plate weights
const plateColors: Record<
  number,
  {
    gradient: string;
    stroke: string;
    width: number;
    height: number;
  }
> = {
  45: {
    gradient: "redGradient",
    stroke: "#8A3230",
    width: 58,
    height: 450,
  },
  35: {
    gradient: "blueGradient",
    stroke: "#1F4C8F",
    width: 50,
    height: 450,
  },
  25: {
    gradient: "yellowGradient",
    stroke: "#876C28",
    width: 39,
    height: 450,
  },
  15: {
    gradient: "greenGradient",
    stroke: "#3B6745",
    width: 35,
    height: 450,
  },
  10: {
    gradient: "whiteGradient",
    stroke: "#4D5A58",
    width: 27,
    height: 280,
  },
  5: {
    gradient: "redGradient",
    stroke: "#8A3230",
    width: 25,
    height: 256,
  },
  2.5: {
    gradient: "blueGradient",
    stroke: "#1F4C8F",
    width: 23,
    height: 213,
  },
};

/**
 * Normalizes plates to lb if unit is kg
 */
const normalizePlates = (platesPerSide: PlateSet, unit: Unit): PlateSet => {
  if (unit === "lb") return platesPerSide;

  const normalized: PlateSet = {};

  Object.entries(platesPerSide).forEach(([weight, count]) => {
    const weightNum = parseFloat(weight);
    const lbWeight = kgToLbMap[weightNum];
    if (lbWeight) {
      normalized[lbWeight] = count;
    }
  });

  return normalized;
};

/**
 * Generates plate arrays from weight sets ensuring consistent order
 */
const generatePlateArrays = (normalizedPlates: PlateSet): [number[], number[]] => {
  const sortedWeights = Object.keys(normalizedPlates)
    .map((w) => parseFloat(w))
    .sort((a, b) => b - a);

  const leftPlates: number[] = [];
  const rightPlates: number[] = [];

  sortedWeights.forEach((weight) => {
    const count = normalizedPlates[weight] || 0;

    for (let i = 0; i < count; i++) {
      leftPlates.push(weight);
      rightPlates.push(weight);
    }
  });

  return [leftPlates, rightPlates];
};

/**
 * Calculates plate positions based on weights with consistent spacing from sleeves
 */
const calculatePlatePositions = (plates: number[]): { weight: number; xPosition: number }[] => {
  const positions: { weight: number; xPosition: number }[] = [];

  // Constants for spacing
  const SLEEVE_GAP = 5; // Gap between sleeve and first plate
  const PLATE_GAP = 2; // Gap between plates

  let currentX = SLEEVE_GAP; // Start with initial gap from sleeve

  plates.forEach((weight) => {
    const plateWidth = plateColors[weight]?.width || 20;
    currentX += plateWidth / 2;
    positions.push({ weight, xPosition: currentX });
    currentX += plateWidth / 2 + PLATE_GAP;
  });

  return positions;
};

const BarbellSVG: React.FC<BarbellProps> = ({
  platesPerSide,
  barType = "olympic",
  unit = "lb",
  barWeight = unit === "lb" ? 45 : 20,
  width = Dimensions.get("window").width + 300,
  height = Dimensions.get("window").height + 300,
}) => {
  // Use memoization to optimize calculations
  const { leftPositions, rightPositions } = useMemo(() => {
    // Normalize plates to lb if unit is kg
    const normalizedPlates = normalizePlates(platesPerSide, unit);

    // Generate plate arrays
    const [leftPlates, rightPlates] = generatePlateArrays(normalizedPlates);

    // Calculate positions
    const leftPositions = calculatePlatePositions(leftPlates);
    const rightPositions = calculatePlatePositions(rightPlates);

    return { leftPositions, rightPositions };
  }, [platesPerSide, unit]);

  return (
    <View
      style={{
        position: "absolute",
        zIndex: 0,
        overflow: "visible",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents="none"
    >
      <Svg
        width={width - 30}
        height={height - 30}
        transform={"rotate(90)"}
        viewBox="-200 -15 3000 1000" // Extended viewBox with padding on all sides
      >
        <Defs>
          {/* Chrome/Metal gradient for barbell */}
          <LinearGradient
            id="chromeGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#8A8B8C"
            />
            <Stop
              offset="10%"
              stopColor="#8A8B8C"
            />
            <Stop
              offset="19%"
              stopColor="#C0C0CC"
            />
            <Stop
              offset="27%"
              stopColor="#C0C0CC"
            />
            <Stop
              offset="34%"
              stopColor="#F0F5F9"
            />
            <Stop
              offset="41%"
              stopColor="#F0F5F9"
            />
            <Stop
              offset="48%"
              stopColor="#AFB4C6"
            />
            <Stop
              offset="51%"
              stopColor="#AFB4C6"
            />
            <Stop
              offset="54%"
              stopColor="#C8CEDC"
            />
            <Stop
              offset="57%"
              stopColor="#C8CEDC"
            />
            <Stop
              offset="60%"
              stopColor="#D6DBE2"
            />
            <Stop
              offset="70%"
              stopColor="#D6DBE2"
            />
            <Stop
              offset="81%"
              stopColor="#C1C1CE"
            />
            <Stop
              offset="90%"
              stopColor="#C1C1CE"
            />
            <Stop
              offset="100%"
              stopColor="#868789"
            />
          </LinearGradient>

          {/* Red plate gradient - Enhanced for more vibrancy */}
          <LinearGradient
            id="redGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#AA3A36"
            />
            <Stop
              offset="5%"
              stopColor="#B73C33"
            />
            <Stop
              offset="10%"
              stopColor="#C13F38"
            />
            <Stop
              offset="16%"
              stopColor="#D0534E"
            />
            <Stop
              offset="22%"
              stopColor="#E8A9AF"
            />
            <Stop
              offset="26%"
              stopColor="#FFCBCC"
            />
            <Stop
              offset="30%"
              stopColor="#F8C8C7"
            />
            <Stop
              offset="39%"
              stopColor="#C25251"
            />
            <Stop
              offset="48%"
              stopColor="#B74542"
            />
            <Stop
              offset="74%"
              stopColor="#9F413F"
            />
            <Stop
              offset="100%"
              stopColor="#400A0B"
            />
          </LinearGradient>

          {/* Blue plate gradient - More vibrant */}
          <LinearGradient
            id="blueGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#1D58A5"
            />
            <Stop
              offset="5%"
              stopColor="#1960B1"
            />
            <Stop
              offset="10%"
              stopColor="#2672C8"
            />
            <Stop
              offset="16%"
              stopColor="#3682D4"
            />
            <Stop
              offset="22%"
              stopColor="#8CAED9"
            />
            <Stop
              offset="26%"
              stopColor="#B3C8E5"
            />
            <Stop
              offset="30%"
              stopColor="#BACEEA"
            />
            <Stop
              offset="39%"
              stopColor="#4778C4"
            />
            <Stop
              offset="48%"
              stopColor="#2361B5"
            />
            <Stop
              offset="74%"
              stopColor="#2955A3"
            />
            <Stop
              offset="100%"
              stopColor="#081D42"
            />
          </LinearGradient>

          {/* Yellow plate gradient - Brighter */}
          <LinearGradient
            id="yellowGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#E8DA7C"
            />
            <Stop
              offset="5%"
              stopColor="#F5E28A"
            />
            <Stop
              offset="10%"
              stopColor="#F6E38B"
            />
            <Stop
              offset="16%"
              stopColor="#F9E690"
            />
            <Stop
              offset="22%"
              stopColor="#FBEEB0"
            />
            <Stop
              offset="26%"
              stopColor="#FFF7D1"
            />
            <Stop
              offset="30%"
              stopColor="#FCF1CA"
            />
            <Stop
              offset="39%"
              stopColor="#EBDC87"
            />
            <Stop
              offset="48%"
              stopColor="#E4CF68"
            />
            <Stop
              offset="74%"
              stopColor="#D4B84F"
            />
            <Stop
              offset="100%"
              stopColor="#594008"
            />
          </LinearGradient>

          {/* Green plate gradient - More vibrant */}
          <LinearGradient
            id="greenGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#3A8E5F"
            />
            <Stop
              offset="5%"
              stopColor="#3B946A"
            />
            <Stop
              offset="10%"
              stopColor="#4DA578"
            />
            <Stop
              offset="16%"
              stopColor="#59B48A"
            />
            <Stop
              offset="22%"
              stopColor="#9ECEB0"
            />
            <Stop
              offset="26%"
              stopColor="#E0F0E3"
            />
            <Stop
              offset="30%"
              stopColor="#CEE5D0"
            />
            <Stop
              offset="39%"
              stopColor="#58AD7C"
            />
            <Stop
              offset="48%"
              stopColor="#3A8B5A"
            />
            <Stop
              offset="74%"
              stopColor="#2F764A"
            />
            <Stop
              offset="100%"
              stopColor="#0E2817"
            />
          </LinearGradient>

          {/* White plate gradient - Enhanced contrast */}
          <LinearGradient
            id="whiteGradient"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#EAEEF0"
            />
            <Stop
              offset="5%"
              stopColor="#E6EDF0"
            />
            <Stop
              offset="10%"
              stopColor="#EFF6FA"
            />
            <Stop
              offset="16%"
              stopColor="#F1F3F5"
            />
            <Stop
              offset="22%"
              stopColor="#F0F4F6"
            />
            <Stop
              offset="26%"
              stopColor="#E8EEF2"
            />
            <Stop
              offset="30%"
              stopColor="#E2E8EC"
            />
            <Stop
              offset="39%"
              stopColor="#C5CFD4"
            />
            <Stop
              offset="48%"
              stopColor="#B3C0C2"
            />
            <Stop
              offset="74%"
              stopColor="#AAB4B9"
            />
            <Stop
              offset="100%"
              stopColor="#7F8588"
            />
          </LinearGradient>

          {/* Knurling pattern for bar */}
          <Pattern
            id="knurlingPattern"
            width="4"
            height="4"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <Path
              fill="#fff"
              d="M0 0h2v4H0z"
              opacity=".4"
            />
            <Path
              fill="#fff"
              d="M0 0h4v2H0z"
              opacity=".4"
            />
          </Pattern>

          {/* Define plate components for reuse */}
          {Object.entries(plateColors).map(([weight, config]) => (
            <G
              id={`plate-${weight}`}
              key={`plate-def-${weight}`}
            >
              <Rect
                width={config.width}
                height={config.height}
                y={-config.height / 2}
                fill={`url(#${config.gradient})`}
                rx="8"
                ry="8"
              />
              <Rect
                width={config.width - 4}
                height={config.height - 4}
                x="2"
                y={-config.height / 2 + 2}
                fill="transparent"
                stroke={config.stroke}
                strokeOpacity=".5"
                strokeWidth="4"
                rx="8"
                ry="8"
              />
            </G>
          ))}
        </Defs>

        <G
          id="shadowContainer"
          translateX="250" // Increased from 100 to provide more space on the left
          translateY="400" // Increased from 350 to center vertically in new viewBox
        >
          {/* Barbell shaft */}
          <Path
            fill="url(#chromeGradient)"
            stroke="#8a8a8a"
            strokeWidth=".5"
            d="M0-14h1310v28H0z"
            translateX="435"
          />

          {/* Knurling sections */}
          <Path
            fill="url(#knurlingPattern)"
            d="M0-10h195v20H0zM200-10h245v20H200zM595-10h120v20H595zM865-10h245v20H865zM1115-10h195v20h-195z"
            translateX="435"
          />

          {/* Left sleeve */}
          <G
            id="leftSleeveContents"
            translateX="435"
          >
            <Path
              fill="url(#chromeGradient)"
              stroke="#8a8a8a"
              strokeWidth=".5"
              d="M0-35h30v70H0zM-415-25h415v50h-415z"
            />

            {/* Left plates with fixed offset */}
            <G
              id="leftPlates"
              translateX="-415"
            >
              {leftPositions.map((plate, index) => (
                <Use
                  key={`left-plate-${index}`}
                  href={`#plate-${plate.weight}`}
                  x={-plate.xPosition + 412}
                  transform={`rotate(180 ${-plate.xPosition + 412} 0)`} // Rotate around the center of the plate
                  y={0} // Adjust y position to center vertically
                />
              ))}
            </G>
          </G>

          {/* Right sleeve */}
          <G
            id="rightSleeveContents"
            translateX="1745"
          >
            <Path
              fill="url(#chromeGradient)"
              stroke="#8a8a8a"
              strokeWidth=".5"
              d="M0-35h30v70H0zM30-25h415v50H30z"
            />

            {/* Right plates */}
            <G
              id="rightPlates"
              translateX="30"
            >
              {rightPositions.map((plate, index) => (
                <Use
                  key={`right-plate-${index}`}
                  href={`#plate-${plate.weight}`}
                  x={plate.xPosition}
                  y={0} // Adjust y position to center vertically
                />
              ))}
            </G>
          </G>
        </G>
      </Svg>
    </View>
  );
};

export default BarbellSVG;
