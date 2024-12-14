import { useState, useEffect } from "react";
import { DeviceMotion } from "expo-sensors";
import * as ScreenOrientation from "expo-screen-orientation";

type OrientationType = "PORTRAIT" | "LANDSCAPE";

const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType>("PORTRAIT");

  useEffect(() => {
    let isMounted = true;

    const setupOrientation = async () => {
      try {
        // Lock screen to portrait to prevent UI rotation
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );

        // Start listening to DeviceMotion updates
        await DeviceMotion.setUpdateInterval(500); // Update every 500ms

        const subscription = DeviceMotion.addListener((deviceMotionData) => {
          if (!isMounted) return;

          const { gamma } = deviceMotionData.rotation || { gamma: 0 };

          // gamma is the rotation around the Y-axis
          // Convert gamma from radians to degrees
          const degrees = (gamma * 180) / Math.PI;

          // Determine orientation based on device rotation
          // We use an offset of ±45 degrees to determine landscape vs portrait
          const isLandscape = Math.abs(degrees) > 45;

          setOrientation(isLandscape ? "LANDSCAPE" : "PORTRAIT");
        });

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error("Failed to setup device motion:", error);
      }
    };

    setupOrientation();

    return () => {
      isMounted = false;
      DeviceMotion.removeAllListeners();
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === "PORTRAIT",
    isLandscape: orientation === "LANDSCAPE",
  };
};

export default useDeviceOrientation;
