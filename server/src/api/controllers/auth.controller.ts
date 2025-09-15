import type { Request, Response } from "express";
import { authService } from "@/api/services/auth.service";
import { asyncHandler, sendResponse } from "@/utils";
import { env } from "@/config";
import { HTTP_STATUS_CODE } from "@/utils/constant";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.body;
    const result = await authService.login(pin);

    // Set cookies if configured to use them
    if (env.USE_COOKIES) {
      res.cookie("access_token", result.tokens.accessToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
    }

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Login successful",
      data: result,
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await authService.logout(userId);

    if (env.USE_COOKIES) {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
      });
    }

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Logged out successfully",
    });
  }),
};
