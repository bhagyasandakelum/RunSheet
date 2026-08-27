import { User, Event, Team, Task, TaskAssignment } from "@/types/common/entities";

/**
 * Contextual Permission Helpers
 * 
 * Authorization in RunSheet is strictly derived from the relational context:
 * User + Event + Team + Leader relationship.
 */

/**
 * Check if the user is the organizer of the given event.
 */
export function isEventOrganizer(user: User | null | undefined, event: Event | null | undefined): boolean {
  if (!user || !event) return false;
  return event.organizerId === user.userId;
}

/**
 * Check if the user is the leader of the given team.
 */
export function isTeamLeader(user: User | null | undefined, team: Team | null | undefined): boolean {
  if (!user || !team) return false;
  if (team.leader?.eventMember?.userId === user.userId) return true;
  if ((team as any).leaderMembership?.eventMember?.userId === user.userId) return true;
  return false;
}

/**
 * Can user manage the event (edit details, change status, delete event)?
 * Only Event Organizer.
 */
export function canManageEvent(user: User | null | undefined, event: Event | null | undefined): boolean {
  return isEventOrganizer(user, event);
}

/**
 * Can user manage event membership (invite, remove members)?
 * Only Event Organizer.
 */
export function canManageEventMembers(user: User | null | undefined, event: Event | null | undefined): boolean {
  return isEventOrganizer(user, event);
}

/**
 * Can user create/delete teams?
 * Only Event Organizer.
 */
export function canCreateOrDeleteTeams(user: User | null | undefined, event: Event | null | undefined): boolean {
  return isEventOrganizer(user, event);
}

/**
 * Can user manage team details/members of a specific team?
 * Event Organizer or Team Leader of that specific team.
 */
export function canManageTeam(
  user: User | null | undefined,
  event: Event | null | undefined,
  team: Team | null | undefined
): boolean {
  if (isEventOrganizer(user, event)) return true;
  if (isTeamLeader(user, team)) return true;
  return false;
}

/**
 * Can user create, edit, or delete tasks for a team?
 * Event Organizer or Team Leader of that specific team.
 */
export function canManageTeamTasks(
  user: User | null | undefined,
  event: Event | null | undefined,
  team: Team | null | undefined
): boolean {
  if (isEventOrganizer(user, event)) return true;
  if (isTeamLeader(user, team)) return true;
  return false;
}

/**
 * Can user assign members to a task?
 * Event Organizer or Team Leader of the task's team.
 */
export function canAssignTaskMembers(
  user: User | null | undefined,
  event: Event | null | undefined,
  task: Task | null | undefined
): boolean {
  if (isEventOrganizer(user, event)) return true;
  if (isTeamLeader(user, task?.team)) return true;
  return false;
}

/**
 * Can user change the overall Task.status (Completed, InProgress, OnHold, etc.)?
 * Event Organizer or Team Leader of the task's team.
 */
export function canUpdateOverallTaskStatus(
  user: User | null | undefined,
  event: Event | null | undefined,
  task: Task | null | undefined
): boolean {
  if (isEventOrganizer(user, event)) return true;
  if (isTeamLeader(user, task?.team)) return true;
  return false;
}

/**
 * Can user update assignment progress (TaskAssignment.assignmentStatus)?
 * The assigned member (own assignment only), Team Leader of that team, or Event Organizer.
 */
export function canUpdateAssignmentProgress(
  user: User | null | undefined,
  assignment: TaskAssignment | null | undefined,
  event?: Event | null,
  team?: Team | null
): boolean {
  if (!user || !assignment) return false;
  
  // Assigned member for their own assignment
  const assigneeUserId =
    assignment.teamMembership?.eventMember?.user?.userId ||
    (assignment as any).userId ||
    (assignment as any).teamMembership?.eventMember?.userId;

  if (assigneeUserId === user.userId) return true;

  // Organizer or Team Leader override
  if (event && isEventOrganizer(user, event)) return true;
  if (team && isTeamLeader(user, team)) return true;

  return false;
}
