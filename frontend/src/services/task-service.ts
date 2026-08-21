import { apiClient } from "./api/api-client";
import { Task } from "@/types/common/entities";
import { TaskPriority, TaskStatus } from "@/types/common/enums";
import { QueryParams } from "@/types/api/api-response";

export interface CreateTaskDto {
  taskTitle: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskDto {
  taskTitle?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export const taskService = {
  async createTask(teamId: string, data: CreateTaskDto): Promise<Task> {
    return apiClient.post<Task>(`/teams/${teamId}/tasks`, data);
  },

  async getTeamTasks(teamId: string, params?: QueryParams): Promise<Task[]> {
    return apiClient.get<Task[]>(`/teams/${teamId}/tasks`, { params });
  },

  async getEventTasks(eventId: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/events/${eventId}/tasks`);
  },

  async searchTasks(params?: QueryParams): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/search", { params });
  },

  async getMyTeamTasks(eventId?: string): Promise<Task[]> {
    return apiClient.get<Task[]>("/tasks/my-team", { params: { eventId } });
  },

  async getTaskStatistics(eventId: string): Promise<TaskStatistics> {
    return apiClient.get<TaskStatistics>(`/events/${eventId}/task-statistics`);
  },

  async getTaskDetails(taskId: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${taskId}`);
  },

  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, data);
  },

  async updateTaskStatus(taskId: string, data: UpdateTaskStatusDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}/status`, data);
  },

  async deleteTask(taskId: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${taskId}`);
  },
};
