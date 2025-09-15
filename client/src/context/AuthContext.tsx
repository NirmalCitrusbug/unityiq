"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "@/types";
import { authService } from "@/services/auth";
import { message } from "antd";
import { setCookie, getCookie, removeCookie } from "@/utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_COOKIE = "user";
const TOKEN_COOKIE = "accessToken";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = getCookie(USER_COOKIE);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const login = async (pin: string) => {
    try {
      const response = await authService.login(pin);
      setUser(response.data.user);
      setCookie(TOKEN_COOKIE, response.data.tokens.accessToken);
      setCookie(USER_COOKIE, JSON.stringify(response.data.user));
    } catch (error) {
      message.error("Invalid PIN");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    removeCookie(TOKEN_COOKIE);
    removeCookie(USER_COOKIE);
    window.location.href = "/auth";
  };

  const checkPermission = (
    module: keyof User["role"]["permissions"],
    action: "create" | "read" | "update" | "delete"
  ): boolean => {
    if (!user) return false;
    return user.role.permissions[module][action];
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, checkPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
