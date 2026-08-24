import {
  EventStatus,
  InvitationStatus,
  TaskStatus,
  TaskPriority,
  AssignmentStatus,
  NotificationType,
} from "./enums";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhotoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  eventId: string;
  organizerId: string;
  eventName: string;
  description?: string | null;
  venue: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;

  // Optional relations
  organizer?: User;
  members?: EventMember[];
  teams?: Team[];
  invitations?: Invitation[];
}

export interface Invitation {
  invitationId: string;
  eventId: string;
  userId: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  event?: Event;
  user?: User;
}

export interface EventMember {
  eventMemberId: string;
  eventId: string;
  userId: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  event?: Event;
  user?: User;
  teamMembership?: TeamMembership | null;
}

export interface Team {
  teamId: string;
  eventId: string;
  leaderMembershipId?: string | null;
  teamName: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed / Response properties
  leaderName?: string | null;
  memberCount?: number;
  taskCount?: number;

  // Relations
  event?: Event;
  leader?: TeamMembership | any | null;
  members?: TeamMembership[] | any[];
  tasks?: Task[];
}

export interface TeamMembership {
  teamMembershipId: string;
  teamId: string;
  eventMemberId: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  team?: Team;
  eventMember?: EventMember;
  assignedTasks?: TaskAssignment[];
  leadingTeam?: Team | null;
}

export interface Task {
  taskId: string;
  teamId: string;
  createdByMemberId: string;
  taskTitle: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  team?: Team;
  createdBy?: EventMember;
  assignments?: TaskAssignment[];
}

export interface TaskAssignment {
  taskAssignmentId: string;
  taskId: string;
  teamMembershipId: string;
  assignedByMemberId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  task?: Task;
  teamMembership?: TeamMembership;
  assignedBy?: EventMember;
}

export interface Notification {
  notificationId: string;
  eventMemberId: string;
  relatedEventId?: string | null;
  relatedTaskId?: string | null;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  eventMember?: EventMember;
  relatedEvent?: Event | null;
  relatedTask?: Task | null;
}
