export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string | string[];
  timestamp?: string;
  path?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
  [key: string]: string | number | boolean | undefined | null;
}
