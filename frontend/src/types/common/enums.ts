export enum EventStatus {
  Draft = "Draft",
  Planning = "Planning",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Archived = "Archived",
}

export enum InvitationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Expired = "Expired",
}

export enum TaskStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  OnHold = "OnHold",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Overdue = "Overdue",
}

export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum AssignmentStatus {
  Assigned = "Assigned",
  InProgress = "InProgress",
  Completed = "Completed",
}

export enum NotificationType {
  TaskAssigned = "TaskAssigned",
  TaskUpdated = "TaskUpdated",
  TaskCompleted = "TaskCompleted",
  DeadlineReminder = "DeadlineReminder",
  TaskOverdue = "TaskOverdue",
  TeamInvitation = "TeamInvitation",
  EventInvitation = "EventInvitation",
  GeneralAnnouncement = "GeneralAnnouncement",
}
