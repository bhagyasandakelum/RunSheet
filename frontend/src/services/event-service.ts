import { apiClient } from "./api/api-client";
import { Event } from "@/types/common/entities";
import { EventStatus } from "@/types/common/enums";

export interface CreateEventDto {
  eventName: string;
  description?: string;
  venue: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventDto {
  eventName?: string;
  description?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateEventStatusDto {
  status: EventStatus;
}

export const eventService = {
  async createEvent(data: CreateEventDto): Promise<Event> {
    return apiClient.post<Event>("/events", data);
  },

  async getMyEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>("/events");
  },

  async getEventDetails(eventId: string): Promise<Event> {
    return apiClient.get<Event>(`/events/${eventId}`);
  },

  async updateEvent(eventId: string, data: UpdateEventDto): Promise<Event> {
    return apiClient.patch<Event>(`/events/${eventId}`, data);
  },

  async updateEventStatus(eventId: string, data: UpdateEventStatusDto): Promise<Event> {
    return apiClient.patch<Event>(`/events/${eventId}/status`, data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    return apiClient.delete<void>(`/events/${eventId}`);
  },
};
