import type {Request, Response, NextFunction} from "express";
import {ApiError} from "@/utils";

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, _next: NextFunction) => {
    const user = (req as any).user as {roles: string[]} | undefined;
    if (!user) throw new ApiError(401, "Unauthorized");
    const ok = user.roles.some((r) => roles.includes(r));
    if (!ok) throw new ApiError(403, "Forbidden");
    _next();
  };
}
