import { apiClient } from "./api/api-client";
import { Invitation } from "@/types/common/entities";

export interface CreateInvitationDto {
  email: string;
}

export const invitationService = {
  async inviteUser(eventId: string, data: CreateInvitationDto): Promise<Invitation> {
    return apiClient.post<Invitation>(`/events/${eventId}/invitations`, data);
  },

  async getEventInvitations(eventId: string): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>(`/events/${eventId}/invitations`);
  },

  async getMyInvitations(): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>("/invitations");
  },

  async getInvitationDetails(invitationId: string): Promise<Invitation> {
    return apiClient.get<Invitation>(`/invitations/${invitationId}`);
  },

  async acceptInvitation(invitationId: string): Promise<Invitation> {
    return apiClient.post<Invitation>(`/invitations/${invitationId}/accept`);
  },

  async rejectInvitation(invitationId: string): Promise<Invitation> {
    return apiClient.post<Invitation>(`/invitations/${invitationId}/reject`);
  },
};
