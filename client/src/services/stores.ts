import { api } from "./api";
import { Store, StoreResponse } from "@/types/store";

export const storeService = {
  getStoreById: async (storeId: string): Promise<StoreResponse> => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },
};
