import { api } from "./api";
import { UsersResponse } from "@/types/user";

export const usersService = {
  getUsers: async (page: number, limit: number): Promise<UsersResponse> => {
    const response = await api.get("/users", {
      params: {
        page: String(page),
        limit: String(limit),
      },
    });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};
