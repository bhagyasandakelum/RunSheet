import {
  AssignmentStatus,
  EventStatus,
  NotificationType,
  TaskPriority,
  TaskStatus,
} from '@prisma/client';

export interface EventSummaryWidget {
  eventName: string;
  status: EventStatus;
  venue: string;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  totalTeams: number;
  totalMembers: number;
  totalTasks: number;
  totalTaskAssignments: number;
}

export interface TaskSummaryWidget {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  onHoldTasks: number;
  overdueTasks: number;
  cancelledTasks: number;
  completedPercentage: number;
}

export interface TeamSummaryWidget {
  teamName: string;
  leaderName: string | null;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
}

export interface UpcomingDeadlineTask {
  taskId: string;
  taskTitle: string;
  team: string;
  priority: TaskPriority;
  dueDate: Date | null;
  status: TaskStatus;
}

export interface CriticalTask {
  taskId: string;
  taskTitle: string;
  team: string;
  priority: TaskPriority;
  dueDate: Date | null;
  status: TaskStatus;
}

export interface TimelineActivityItem {
  type: string;
  description: string;
  timestamp: Date;
  relatedId?: string;
}

export interface NotificationSummaryWidget {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
}

export interface OrganizerDashboardResponse {
  eventSummary: EventSummaryWidget;
  taskSummary: TaskSummaryWidget;
  teamSummary: TeamSummaryWidget[];
  overallProgress: number;
  upcomingDeadlines: UpcomingDeadlineTask[];
  criticalTasks: CriticalTask[];
  recentActivities: TimelineActivityItem[];
  notificationSummary: NotificationSummaryWidget;
  teamProgress: TeamSummaryWidget[];
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

export interface MemberUpcomingDeadlineTask {
  taskAssignmentId: string;
  taskId: string;
  taskTitle: string;
  team: string;
  priority: TaskPriority;
  dueDate: Date | null;
  assignmentStatus: AssignmentStatus;
}

export interface MemberHighPriorityTask {
  taskAssignmentId: string;
  taskId: string;
  taskTitle: string;
  team: string;
  priority: TaskPriority;
  dueDate: Date | null;
  assignmentStatus: AssignmentStatus;
}

export interface MemberProgressWidget {
  completedAssignments: number;
  totalAssignments: number;
  completionPercentage: number;
}

export interface MemberNotificationItem {
  notificationId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export interface ActiveEventWidget {
  eventId: string;
  eventName: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
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
  priority: TaskPriority;
  status: TaskStatus;
  assignmentStatus: AssignmentStatus;
  dueDate?: Date | null;
  teamName: string;
  eventName?: string;
}

export interface MemberDashboardResponse {
  profile: MemberProfileWidget;
  taskSummary: MemberTaskSummaryWidget;
  upcomingDeadlines: MemberUpcomingDeadlineTask[];
  highPriorityTasks: MemberHighPriorityTask[];
  progress: MemberProgressWidget;
  notifications: MemberNotificationItem[];
  activeEvent?: ActiveEventWidget | null;
  myTeam?: MyTeamWidget | null;
  actionItems?: MemberActionItem[];
  recentActivities?: TimelineActivityItem[];
}

export interface DashboardStatisticsResponse {
  events: number;
  teams: number;
  members: number;
  tasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}

export interface TeamAnalyticsItem {
  teamName: string;
  memberCount: number;
  taskCount: number;
  completedCount: number;
  pendingCount: number;
  progressPercentage: number;
}

export interface TaskAnalyticsResponse {
  pending: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface PaginatedAssignedTasksResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedNotificationsResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
