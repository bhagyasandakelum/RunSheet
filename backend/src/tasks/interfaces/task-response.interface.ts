import { TaskPriority, TaskStatus } from '@prisma/client';

export interface TaskTeamInfo {
  teamId: string;
  teamName: string;
  description: string | null;
  eventId: string;
  leaderMembershipId?: string | null;
  leader?: any;
}

export interface TaskEventInfo {
  eventId: string;
  eventName: string;
  status: string;
  organizerId: string;
}

export interface TaskCreatorInfo {
  eventMemberId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface TaskDetailsResponse {
  taskId: string;
  teamId: string;
  createdByMemberId: string;
  taskTitle: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  team: TaskTeamInfo;
  event: TaskEventInfo;
  createdBy: TaskCreatorInfo;
  assignmentCount: number;
  completedAssignmentCount: number;
  assignments?: any[];
}

export interface EventTaskListItem {
  taskId: string;
  teamId: string;
  teamName: string;
  taskTitle: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  creatorName: string;
  assignments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatisticsResponse {
  totalTasks: number;
  pending: number;
  inProgress: number;
  completed: number;
  onHold: number;
  cancelled: number;
  overdue: number;
  highPriorityCount: number;
  criticalPriorityCount: number;
}
