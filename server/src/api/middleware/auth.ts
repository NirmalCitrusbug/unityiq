import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config";
import { ApiError } from "@/utils";

export type JwtPayload = {
  sub: string; // userId
  roles: string[];
  jti: string;
};

/**
 * Extracts Bearer token from Authorization header or cookie `access_token`.
 */
function getAccessToken(req: Request) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.substring("Bearer ".length);
  const cookieToken = (req as any).cookies?.access_token;
  if (cookieToken) return cookieToken;
  return null;
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const token = getAccessToken(req);
  if (!token) throw new ApiError(401, "Unauthorized");
  try {
    const decoded = jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET
    ) as jwt.JwtPayload & JwtPayload;
    (req as any).user = {
      id: decoded.sub,
      roles: decoded.roles,
      jti: decoded.jti,
    };
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
