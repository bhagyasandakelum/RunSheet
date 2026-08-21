import { apiClient } from "./api/api-client";
import { EventMember } from "@/types/common/entities";

export interface SearchMembersDto {
  query?: string;
}

export const eventMemberService = {
  async getEventMembers(eventId: string): Promise<EventMember[]> {
    return apiClient.get<EventMember[]>(`/events/${eventId}/members`);
  },

  async searchMembers(eventId: string, query?: string): Promise<EventMember[]> {
    return apiClient.get<EventMember[]>(`/events/${eventId}/members/search`, {
      params: { query },
    });
  },

  async getMyMembership(eventId: string): Promise<EventMember> {
    return apiClient.get<EventMember>(`/events/${eventId}/membership`);
  },

  async getMemberDetails(eventId: string, memberId: string): Promise<EventMember> {
    return apiClient.get<EventMember>(`/events/${eventId}/members/${memberId}`);
  },

  async removeMember(eventId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(`/events/${eventId}/members/${memberId}`);
  },
};
