import { apiClient } from "./api/api-client";
import { TaskAssignment } from "@/types/common/entities";
import { AssignmentStatus } from "@/types/common/enums";

export interface AssignMemberDto {
  teamMembershipId: string;
}

export interface UpdateAssignmentStatusDto {
  assignmentStatus: AssignmentStatus;
}

export interface AssignmentStatistics {
  totalAssignments: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

export const taskAssignmentService = {
  async assignMemberToTask(taskId: string, data: AssignMemberDto): Promise<TaskAssignment> {
    return apiClient.post<TaskAssignment>(`/tasks/${taskId}/assignments`, data);
  },

  async getTaskAssignments(taskId: string): Promise<TaskAssignment[]> {
    return apiClient.get<TaskAssignment[]>(`/tasks/${taskId}/assignments`);
  },

  async getMyAssignedTasks(): Promise<TaskAssignment[]> {
    return apiClient.get<TaskAssignment[]>("/task-assignments/my");
  },

  async getAssignmentDetails(id: string): Promise<TaskAssignment> {
    return apiClient.get<TaskAssignment>(`/task-assignments/${id}`);
  },

  async updateAssignmentStatus(
    id: string,
    data: UpdateAssignmentStatusDto
  ): Promise<TaskAssignment> {
    return apiClient.patch<TaskAssignment>(`/task-assignments/${id}/status`, data);
  },

  async removeAssignment(id: string): Promise<void> {
    return apiClient.delete<void>(`/task-assignments/${id}`);
  },

  async getAssignmentsByMember(teamMembershipId: string): Promise<TaskAssignment[]> {
    return apiClient.get<TaskAssignment[]>(
      `/team-memberships/${teamMembershipId}/assignments`
    );
  },

  async getAssignmentStatistics(eventId: string): Promise<AssignmentStatistics> {
    return apiClient.get<AssignmentStatistics>(
      `/events/${eventId}/assignment-statistics`
    );
  },
};
