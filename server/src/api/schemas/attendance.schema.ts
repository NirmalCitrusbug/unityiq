import { z } from "zod";

const locationSchema = z.object({
  latitude: z.coerce
    .number({
      error: "Latitude is required",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number({
      error: "Longitude is required",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export const clockInSchema = z.object({
  body: z.object({
    storeId: z.string().min(1, "Store ID is required"),
    ...locationSchema.shape,
  }),
});

export const clockOutSchema = z.object({
  body: locationSchema,
});

export const getAttendanceSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});
