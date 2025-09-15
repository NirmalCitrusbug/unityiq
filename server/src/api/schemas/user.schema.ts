import { z } from "zod";

export const getUsersSchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return val === "true";
      }),
    roleId: z.string().optional(),
    storeId: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
  }),
});
