import { apiClient } from "./api/api-client";
import { User } from "@/types/common/entities";

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string | null;
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/users/profile");
  },

  async updateProfile(data: UpdateProfileDto): Promise<User> {
    return apiClient.patch<User>("/users/profile", data);
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
