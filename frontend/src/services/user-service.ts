import { apiClient } from "./api/api-client";
import { User } from "@/types/common/entities";

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/users/profile");
  },
};
