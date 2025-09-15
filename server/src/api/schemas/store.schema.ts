import { z } from "zod";

export const getStoresSchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return val === "true";
      }),
    brandId: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const getStoreByIdSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, "Store ID is required"),
  }),
});

export const updateStoreLocationSchema = z.object({
  params: z.object({
    storeId: z.string().min(1, "Store ID is required"),
  }),
  body: z.object({
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    geofenceRadius: z
      .number()
      .min(10, "Geofence radius must be at least 10 meters")
      .max(1000, "Geofence radius cannot exceed 1000 meters")
      .optional(),
  }),
});
