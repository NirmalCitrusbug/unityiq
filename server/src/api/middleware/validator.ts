import type { Request, Response, NextFunction } from "express";
import type { ZodObject, ZodError } from "zod";
import { ApiError } from "@/utils";
import { logger } from "@/config";

export function validate(schema: ZodObject<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const error = result.error;
        logger.debug(
          {
            body: req.body,
            error: error.issues,
          },
          "Validation failed"
        );

        const message = error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        return next(new ApiError(400, message));
      }

      console.log(result.data);

      // Replace request data with validated data
      if (result.data.body) req.body = result.data.body;
      // Only assign query and params if they were validated in the schema
      if (schema.shape.query && result.data.query)
        req.query = result.data.query as any;
      if (schema.shape.params && result.data.params)
        req.params = result.data.params as any;

      next();
    } catch (error) {
      logger.error(error, "Validation middleware error");
      next(new ApiError(500, "Internal validation error"));
    }
  };
}
