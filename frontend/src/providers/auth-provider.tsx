"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, LoginCredentials } from "@/types/auth/auth-types";
import { authService } from "@/services/auth/auth-service";
import { getAuthToken } from "@/lib/auth/cookies";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("runsheet_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      if (typeof window !== "undefined") {
        localStorage.setItem("runsheet_user", JSON.stringify(profile));
      }
    } catch {
      console.warn("Preserving existing user session on refresh failure.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await authService.getProfile();
        if (isMounted) {
          setUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("runsheet_user", JSON.stringify(profile));
          }
        }
      } catch {
        console.warn("Using cached credentials for active session.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response?.user) {
        setUser(response.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("runsheet_user", JSON.stringify(response.user));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
