import {api} from "./api";
import {AttendanceStatus} from "@/types/attendance";

export const attendanceService = {
  clockIn: async ({
    storeId,
    latitude,
    longitude,
    image,
  }: {
    storeId: string;
    latitude: number;
    longitude: number;
    image: File;
  }) => {
    const formData = new FormData();
    formData.append('storeId', storeId);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('image', image);

    const response = await api.post("/attendance/clock-in", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  clockOut: async ({
    storeId,
    latitude,
    longitude,
  }: {
    storeId: string;
    latitude: number;
    longitude: number;
  }) => {
    const response = await api.post("/attendance/clock-out", {
      storeId,
      latitude,
      longitude,
    });
    return response.data;
  },

  getAttendanceStatus: async (
    userId: string
  ): Promise<{data: AttendanceStatus}> => {
    const response = await api.get(`/attendance/status`);
    return response.data;
  },
};
