import { api } from "./api";

export const reportService = {
  getAttendanceReport: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(
      `/attendance/report?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
