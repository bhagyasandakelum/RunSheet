import { apiClient } from "./api/api-client";
import { QueryParams } from "@/types/api/api-response";
import { TaskAssignment, Notification, Event } from "@/types/common/entities";

export interface TeamAnalyticsItem {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface TaskAnalyticsData {
  pending: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface MemberProfileWidget {
  firstName: string;
  lastName: string;
  email?: string;
  profilePhotoUrl?: string | null;
  team: string | null;
  teamId?: string | null;
  event: string | null;
  eventId?: string | null;
  isTeamLeader: boolean;
}

export interface MemberTaskSummaryWidget {
  assigned: number;
  inProgress: number;
  completed: number;
  pending: number;
  overdue: number;
  total: number;
  assignedTrend?: string;
  completedTrend?: string;
  pendingTrend?: string;
  overdueTrend?: string;
}

export interface ActiveEventWidget {
  eventId: string;
  eventName: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  isLive: boolean;
  description?: string | null;
}

export interface TeamMemberItem {
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string | null;
  isLeader: boolean;
}

export interface MyTeamWidget {
  teamId: string;
  teamName: string;
  memberCount: number;
  members: TeamMemberItem[];
}

export interface MemberActionItem {
  taskAssignmentId: string;
  taskId: string;
  taskTitle: string;
  location?: string | null;
  priority: string;
  status: string;
  assignmentStatus: string;
  dueDate?: string | null;
  teamName: string;
  eventName?: string;
}

export interface MemberDashboard {
  profile: MemberProfileWidget;
  taskSummary: MemberTaskSummaryWidget;
  upcomingDeadlines?: any[];
  highPriorityTasks?: any[];
  progress?: {
    completedAssignments: number;
    totalAssignments: number;
    completionPercentage: number;
  };
  notifications?: any[];
  activeEvent?: ActiveEventWidget | null;
  myTeam?: MyTeamWidget | null;
  actionItems?: MemberActionItem[];
  recentActivities?: any[];
}

export interface EventStatistics {
  totalMembers: number;
  totalTeams: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface OrganizerDashboard {
  event: Event;
  statistics: EventStatistics;
  teamAnalytics: TeamAnalyticsItem[];
  taskAnalytics: TaskAnalyticsData;
  recentTimeline: TimelineItem[];
}

export const dashboardService = {
  async getMemberDashboard(): Promise<MemberDashboard> {
    return apiClient.get<MemberDashboard>("/dashboard/me");
  },

  async getMyTasks(params?: QueryParams): Promise<TaskAssignment[]> {
    return apiClient.get<TaskAssignment[]>("/dashboard/me/tasks", { params });
  },

  async getMyNotifications(params?: QueryParams): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/dashboard/me/notifications", { params });
  },

  async getOrganizerDashboard(eventId: string): Promise<OrganizerDashboard> {
    return apiClient.get<OrganizerDashboard>(`/dashboard/events/${eventId}`);
  },

  async getEventStatistics(eventId: string): Promise<EventStatistics> {
    return apiClient.get<EventStatistics>(`/dashboard/events/${eventId}/statistics`);
  },

  async getTeamAnalytics(eventId: string): Promise<TeamAnalyticsItem[]> {
    return apiClient.get<TeamAnalyticsItem[]>(`/dashboard/events/${eventId}/team-analytics`);
  },

  async getTaskAnalytics(eventId: string): Promise<TaskAnalyticsData> {
    return apiClient.get<TaskAnalyticsData>(`/dashboard/events/${eventId}/task-analytics`);
  },

  async getTimeline(eventId: string): Promise<TimelineItem[]> {
    return apiClient.get<TimelineItem[]>(`/dashboard/events/${eventId}/timeline`);
  },
};
