import type {NextFunction, Request, Response} from "express";

export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(
    fn: T
  ) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
