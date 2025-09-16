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
        console.log("Accuracy in meters:", position);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location error:", error);
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
};
