export interface Location {
  latitude: number;
  longitude: number;
}

export interface Store {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  geofenceRadius: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface CurrentAttendance {
  clockIn: {
    location: GeoLocation;
    time: string;
  };
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  storeId: {
    location: GeoLocation;
    _id: string;
    geofenceRadius: number;
  };
  status: "ACTIVE" | "COMPLETED";
  isWithinGeofence: boolean;
  createdAt: string;
  updatedAt: string;
  duration?: number;
  clockOut?: {
    location: GeoLocation;
    time: string;
  };
}

export interface AttendanceStatus {
  isClockIn: boolean; // Keeping for backward compatibility
  isClockedIn: boolean;
  currentAttendance?: CurrentAttendance;
}
