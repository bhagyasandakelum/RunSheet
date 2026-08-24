import { apiClient } from "./api/api-client";
import { User } from "@/types/common/entities";

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/users/profile");
  },

  async searchUsers(query?: string, excludeUserIds?: string[]): Promise<User[]> {
    return apiClient.get<User[]>("/users/search", {
      params: {
        q: query,
        exclude: excludeUserIds?.join(","),
      },
    });
  },
};
