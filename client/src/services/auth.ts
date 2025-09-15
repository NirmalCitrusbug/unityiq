import {api} from "./api";
import {AuthResponse} from "@/types/auth";

export const authService = {
  login: async (pin: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", {pin});
    return response.data;
  },
};
