import { apiClient } from "./api/api-client";
import { EventMember, TeamMembership } from "@/types/common/entities";

export interface AddMemberDto {
  eventMemberId?: string;
  userId?: string;
  email?: string;
}

export interface TransferMemberDto {
  targetTeamId: string;
}

export interface TeamStatistics {
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export const teamMembershipService = {
  async addMemberToTeam(teamId: string, data: AddMemberDto): Promise<TeamMembership> {
    return apiClient.post<TeamMembership>(`/teams/${teamId}/members`, data);
  },

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    return apiClient.get<TeamMembership[]>(`/teams/${teamId}/members`);
  },

  async getTeamStatistics(teamId: string): Promise<TeamStatistics> {
    return apiClient.get<TeamStatistics>(`/teams/${teamId}/statistics`);
  },

  async getMyTeamMembership(eventId?: string): Promise<TeamMembership> {
    return apiClient.get<TeamMembership>("/team-memberships/me", {
      params: { eventId },
    });
  },

  async getTeamMembershipDetails(id: string): Promise<TeamMembership> {
    return apiClient.get<TeamMembership>(`/team-memberships/${id}`);
  },

  async transferMember(id: string, data: TransferMemberDto): Promise<TeamMembership> {
    return apiClient.patch<TeamMembership>(`/team-memberships/${id}/transfer`, data);
  },

  async removeMember(id: string): Promise<void> {
    return apiClient.delete<void>(`/team-memberships/${id}`);
  },

  async getUnassignedMembers(eventId: string): Promise<EventMember[]> {
    return apiClient.get<EventMember[]>(`/events/${eventId}/unassigned-members`);
  },
};
