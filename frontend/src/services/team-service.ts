import { apiClient } from "./api/api-client";
import { Team } from "@/types/common/entities";

export interface CreateTeamDto {
  teamName: string;
  description?: string;
  leaderUserId?: string;
  leaderEventMemberId?: string;
}

export interface UpdateTeamDto {
  teamName?: string;
  description?: string;
}

export interface AssignTeamLeaderDto {
  teamMembershipId: string;
}

export const teamService = {
  async createTeam(eventId: string, data: CreateTeamDto): Promise<Team> {
    return apiClient.post<Team>(`/events/${eventId}/teams`, data);
  },

  async getTeamsByEvent(eventId: string): Promise<Team[]> {
    return apiClient.get<Team[]>(`/events/${eventId}/teams`);
  },

  async getMyTeam(eventId?: string): Promise<Team> {
    return apiClient.get<Team>("/teams/my", { params: { eventId } });
  },

  async getTeamDetails(teamId: string): Promise<Team> {
    return apiClient.get<Team>(`/teams/${teamId}`);
  },

  async updateTeam(teamId: string, data: UpdateTeamDto): Promise<Team> {
    return apiClient.patch<Team>(`/teams/${teamId}`, data);
  },

  async deleteTeam(teamId: string): Promise<void> {
    return apiClient.delete<void>(`/teams/${teamId}`);
  },

  async assignTeamLeader(teamId: string, data: AssignTeamLeaderDto): Promise<Team> {
    return apiClient.patch<Team>(`/teams/${teamId}/leader`, data);
  },

  async removeTeamLeader(teamId: string): Promise<Team> {
    return apiClient.delete<Team>(`/teams/${teamId}/leader`);
  },
};
