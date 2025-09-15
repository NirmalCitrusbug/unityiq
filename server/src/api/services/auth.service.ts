import jwt from "jsonwebtoken";
import crypto from "crypto";
import {User} from "@/models";
import {env, logger} from "@/config";
import {ApiError} from "@/utils";
import type {JwtPayload} from "@/api/middleware/auth";

interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    storeIds: string[];
    role: {
      name: string;
      permissions: Record<string, Record<string, boolean>>;
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  async login(pin: string): Promise<LoginResponse> {
    try {
      // Validate PIN format
      if (!pin || !/^\d{4}$/.test(pin)) {
        throw new ApiError(400, "PIN must be exactly 4 digits");
      }

      // Find user by PIN
      const user = await User.findOne({pin, isActive: true})
        .populate<{
          roleId: {
            name: string;
            permissions: Record<string, Record<string, boolean>>;
          };
        }>("roleId")
        .populate("storeIds");

      if (!user) {
        throw new ApiError(401, "Invalid PIN");
      }

      if (!user.roleId) {
        throw new ApiError(500, "User role not found");
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const payload: Omit<JwtPayload, "jti"> = {
        sub: user.id,
        roles: [user.roleId.name],
      };

      const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
        expiresIn: env.ACCESS_TOKEN_TTL,
        jwtid: crypto.randomUUID(),
      } as jwt.SignOptions);

      // Format response
      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          storeIds: user.storeIds.map((store) => store._id.toString()),
          role: {
            name: user.roleId.name,
            permissions: user.roleId.permissions,
          },
        },
        tokens: {
          accessToken,
          refreshToken: "", // Implement refresh token logic if needed
        },
      };
    } catch (error: any) {
      logger.error({error, pin}, "Login failed");
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Login failed due to an unexpected error");
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Clear last login time
      user.lastLoginAt = undefined;
      await user.save();

      logger.info({userId}, "User logged out successfully");
    } catch (error: any) {
      logger.error({error, userId}, "Logout failed");
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Logout failed due to an unexpected error");
    }
  }
}

export const authService = new AuthService();
