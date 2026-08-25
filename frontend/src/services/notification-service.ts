import { apiClient } from "./api/api-client";
import { Notification } from "@/types/common/entities";
import { QueryParams } from "@/types/api/api-response";

export interface SendAnnouncementDto {
  title: string;
  message: string;
}

export interface NotificationStatistics {
  totalNotifications: number;
  read: number;
  unread: number;
  expired: number;
  byType: Record<string, number>;
}

export interface NotificationFilterParams extends QueryParams {
  unreadOnly?: boolean;
  notificationType?: string;
  page?: number;
  limit?: number;
}

export const notificationService = {
  async getMyNotifications(params?: NotificationFilterParams): Promise<Notification[]> {
    const res = await apiClient.get<any>("/notifications", { params });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getNotificationStatistics(): Promise<NotificationStatistics> {
    return apiClient.get<NotificationStatistics>("/notifications/statistics");
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>("/notifications/read-all");
  },

  async deleteExpiredNotifications(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>("/notifications/expired");
  },

  async sendGeneralAnnouncement(
    eventId: string,
    data: SendAnnouncementDto
  ): Promise<Notification[]> {
    return apiClient.post<Notification[]>(`/events/${eventId}/announcements`, data);
  },

  async getNotificationDetails(id: string): Promise<Notification> {
    return apiClient.get<Notification>(`/notifications/${id}`);
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}/read`);
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${id}`);
  },
};
