import { Location } from "@/types/attendance";
import { getDistance } from "geolib";

export const calculateDistance = (
  point1: Location,
  point2: Location
): number => {
  return getDistance(
    { lat: point1.latitude, lng: point1.longitude },
    { lat: point2.latitude, lng: point2.longitude }
  );
};

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Got location:", { latitude, longitude });

        resolve({ latitude, longitude });
      },
      (error) => {
        console.error("Location error:", error);
        reject(error);
      }
    );
  });
};

export const watchLocation = async (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Watching location:", { latitude, longitude });

        navigator.geolocation.clearWatch(watchId); // stop after first result
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error("Location error:", error);
        reject(error);
      }
    );
  });
};
