import { AssignmentStatus, TaskPriority, TaskStatus } from '@prisma/client';

export interface TaskAssigneeItem {
  taskAssignmentId: string;
  teamMembershipId: string;
  eventMemberId: string;
  userId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: Date;
  completedAt: Date | null;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
  isLeader: boolean;
  user?: UserSummary;
  teamMembership?: {
    teamMembershipId: string;
    eventMemberId: string;
    eventMember?: {
      eventMemberId: string;
      userId: string;
      user?: UserSummary;
    };
  };
}

export interface UserSummary {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string | null;
}

export interface TaskSummary {
  taskId: string;
  taskTitle: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  teamId: string;
  teamName?: string;
}

export interface MemberSummary {
  teamMembershipId: string;
  eventMemberId: string;
  user: UserSummary;
}

export interface AssignmentDetailsResponse {
  taskAssignmentId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: Date;
  completedAt: Date | null;
  task: TaskSummary;
  member: MemberSummary;
  assignedBy: {
    eventMemberId: string;
    user: UserSummary;
  };
}

export interface MyAssignmentListItem {
  taskAssignmentId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: Date;
  completedAt: Date | null;
  task: {
    taskId: string;
    taskTitle: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
    team: {
      teamId: string;
      teamName: string;
    };
  };
}

export interface MemberAssignmentListItem {
  taskAssignmentId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: Date;
  completedAt: Date | null;
  task: {
    taskId: string;
    taskTitle: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
  };
}

export interface AssignmentStatisticsResponse {
  totalAssignments: number;
  assigned: number;
  inProgress: number;
  completed: number;
  averageAssignmentsPerMember: number;
  membersWithNoAssignments: number;
  overloadedMembers: number;
}
