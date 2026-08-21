import { ApiError } from "@/lib/api/api-error";
import { getAuthToken } from "@/lib/auth/cookies";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

class ApiClient {
  private get baseUrl(): string {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return url.replace(/\/$/, "");
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    return fullUrl.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeoutMs = 15000,
      params,
      skipAuth = false,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(customHeaders as Record<string, string>),
    };

    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 204) {
        return {} as T;
      }

      let data: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw ApiError.fromResponse(response.status, data, endpoint);
      }

      // Automatically unwrap NestJS TransformInterceptor envelope: { success: true, data: T }
      if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        "data" in data &&
        (data as { success: boolean }).success === true
      ) {
        return (data as { data: T }).data;
      }

      return data as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name: string }).name === "AbortError"
      ) {
        throw new ApiError(
          408,
          "Request timed out. Please check your network connection.",
          null,
          endpoint
        );
      }

      const errMessage =
        error instanceof Error
          ? error.message
          : "Failed to communicate with backend server.";

      throw new ApiError(500, errMessage, error, endpoint);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
