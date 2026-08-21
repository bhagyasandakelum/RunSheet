import { apiClient } from "@/services/api/api-client";
import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
} from "@/types/auth/auth-types";
import { removeAuthToken, setAuthToken } from "@/lib/auth/cookies";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res: any = await apiClient.post<any>("/auth/login", credentials, {
      skipAuth: true,
    });

    const token = res?.accessToken || res?.data?.accessToken;
    const user = res?.user || res?.data?.user;

    if (token) {
      setAuthToken(token);
    }

    if (user && typeof window !== "undefined") {
      try {
        localStorage.setItem("runsheet_user", JSON.stringify(user));
      } catch (e) {
        console.warn("Unable to save user in localStorage", e);
      }
    }

    return { accessToken: token, user };
  },

  async register(registerData: RegisterData): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/auth/register", registerData, {
      skipAuth: true,
    });
  },

  async getProfile(): Promise<AuthUser> {
    return apiClient.get<AuthUser>("/users/profile");
  },

  logout(): void {
    removeAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("runsheet_user");
    }
  },
};
