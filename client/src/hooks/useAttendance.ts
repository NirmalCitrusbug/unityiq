"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCurrentLocation,
  calculateDistance,
  watchLocation,
} from "@/utils/location";
import { attendanceService } from "@/services/attendance";
import { storeService } from "@/services/stores";
import { Location, AttendanceStatus } from "@/types/attendance";
import { Store } from "@/types/store";
import { message } from "antd";
import { useAuth } from "@/context";
import { getLatitude, getLongitude } from "geolib";

export const useAttendance = (userId: string) => {
  const { user } = useAuth(); // Auth context still needed for the provider
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [distanceFromStore, setDistanceFromStore] = useState<number | null>(
    null
  );
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    isClockIn: false,
    isClockedIn: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  const checkLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      console.log("locations", location);
      if (location && currentStore) {
        const distance = calculateDistance(location, {
          latitude: currentStore.location.coordinates[1],
          longitude: currentStore.location.coordinates[0],
        });
        setDistanceFromStore(distance);
        setIsWithinRange(distance <= currentStore.geofenceRadius);
      }
      return true;
    } catch (error) {
      message.error(
        "Failed to get location. Please enable location services and try again."
      );
      console.error("Location error:", error);
      return false;
    }
  }, [currentStore]);

  const updateAttendanceStatus = useCallback(async () => {
    try {
      const response = await attendanceService.getAttendanceStatus(userId);
      setAttendanceStatus({
        isClockIn: response.data.isClockedIn, // For backward compatibility
        isClockedIn: response.data.isClockedIn,
        currentAttendance: response.data.currentAttendance,
      });

      const store = await storeService.getStoreById(user?.storeIds?.[0] || "");

      console.log(store);

      // setIsWithinRange(store.data.isWithinGeofence);
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  }, [userId]);

  const handleClockIn = async (image: File) => {
    if (!currentStore) {
      message.error("Unable to determine store information");
      return;
    }

    if (!image) {
      message.error("Please provide an image for clock in");
      return;
    }

    setLoading(true);
    try {
      await attendanceService.clockIn({
        latitude: currentLocation?.latitude ?? 0,
        longitude: currentLocation?.longitude ?? 0,
        storeId: currentStore._id,
        image,
      });
      await updateAttendanceStatus();
      message.success("Successfully clocked in");
    } catch (error) {
      message.error("Failed to clock in");
      console.error("Clock in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentLocation || !currentStore) {
      message.error("Unable to determine your location or store information");
      return;
    }

    setLoading(true);
    try {
      await attendanceService.clockOut({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        storeId: currentStore._id,
      });
      await updateAttendanceStatus();
      message.success("Successfully clocked out");
    } catch (error) {
      message.error("Failed to clock out");
      console.error("Clock out error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch store data when user changes
  useEffect(() => {
    if (!userId) return;
    const fetchStoreData = async () => {
      if (!userId) return;
      setStoreLoading(true);
      setStoreError(null);

      try {
        const storeId = user?.storeIds?.[0];
        if (!storeId) {
          throw new Error("User is not assigned to any store");
        }

        const response = await storeService.getStoreById(storeId);
        setCurrentStore(response.data);
      } catch (error) {
        console.error("Error fetching store data:", error);
        setStoreError("Failed to load store information");
        message.error("Failed to load store information");
      } finally {
        setStoreLoading(false);
      }
    };

    fetchStoreData();
  }, [userId]);

  // useEffect(() => {
  //   if (currentStore) {
  //     const interval = setInterval(() => checkLocation(), 500);
  //     return () => clearInterval(interval);
  //   }
  // }, [currentStore, checkLocation]);

  useEffect(() => {
    if (currentStore) {
      updateAttendanceStatus();
    }
  }, [currentStore, updateAttendanceStatus]);

  return {
    currentLocation,
    isWithinRange,
    distanceFromStore,
    attendanceStatus,
    loading: loading || storeLoading,
    currentStore,
    storeError,
    checkLocation,
    handleClockIn,
    handleClockOut,
  };
};
