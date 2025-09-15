import { Store } from "@/models";
import { ApiError } from "@/utils";
import { logger } from "@/config";

const HTTP_STATUS_CODE = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

interface UpdateStoreLocationData {
  storeId: string;
  latitude: number;
  longitude: number;
  geofenceRadius?: number;
}

interface GetStoresQuery {
  isActive?: boolean;
  brandId?: string;
  search?: string;
}

class StoreService {
  /**
   * Get all stores with optional filtering
   */
  /**
   * Get store by ID
   */
  async getById(storeId: string) {
    try {
      const store = await Store.findById(storeId)
        .populate("brandId", "name")
        .populate("locationId", "name address city state country postalCode");

      if (!store) {
        throw new ApiError(HTTP_STATUS_CODE.NOT_FOUND, "Store not found");
      }

      return store;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        "Error fetching store"
      );
    }
  }

  /**
   * Get all stores with optional filtering
   */
  async getAll(query: GetStoresQuery = {}) {
    try {
      const filter: any = {};

      // Filter by active status if specified
      if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
      }

      // Filter by brand if specified
      if (query.brandId) {
        filter.brandId = query.brandId;
      }

      // Add search functionality for location name or address
      if (query.search) {
        const searchRegex = new RegExp(query.search, "i");
        filter.$or = [
          { "locationDetails.name": searchRegex },
          { "locationDetails.address": searchRegex },
          { "locationDetails.city": searchRegex },
        ];
      }

      const stores = await Store.find(filter)
        .populate("brandId", "name")
        .populate("locationId", "name address city state country postalCode")
        .sort({ "locationDetails.name": 1 });

      return stores;
    } catch (error) {
      logger.error({ error }, "Failed to fetch stores");
      throw error;
    }
  }

  /**
   * Update store location coordinates
   */
  async updateLocation({
    storeId,
    latitude,
    longitude,
    geofenceRadius,
  }: UpdateStoreLocationData) {
    try {
      const store = await Store.findById(storeId);

      if (!store) {
        throw new ApiError(404, "Store not found");
      }

      // Update store location
      store.location = {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format is [longitude, latitude]
      };

      // Update geofence radius if provided
      if (geofenceRadius !== undefined) {
        store.geofenceRadius = geofenceRadius;
      }

      await store.save();

      logger.info({ storeId, latitude, longitude }, "Store location updated");

      return store;
    } catch (error) {
      logger.error(
        { error, storeId, latitude, longitude },
        "Failed to update store location"
      );
      throw error;
    }
  }
}

export const storeService = new StoreService();
