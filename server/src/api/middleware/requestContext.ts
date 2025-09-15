import type {Request, Response, NextFunction} from "express";
import {randomUUID} from "crypto";

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers["x-request-id"]?.toString() ?? randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
