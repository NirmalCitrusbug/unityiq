import {z} from "zod";

export const loginSchema = z.object({
  body: z.object({
    pin: z
      .string()
      .trim()
      .length(4, "PIN must be exactly 4 digits")
      .regex(/^\d+$/, "PIN must contain only digits")
      .transform((val) => val.padStart(4, "0")), // Ensure 4 digits by padding with zeros
  }),
});
