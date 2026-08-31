import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentStatus, EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { AssignMemberDto } from './dto/assign-member.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import {
  AssignmentDetailsResponse,
  AssignmentStatisticsResponse,
  MemberAssignmentListItem,
  MyAssignmentListItem,
  TaskAssigneeItem,
} from './interfaces/task-assignment-response.interface';

@Injectable()
export class TaskAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Helper: Verify user is organizer or member of event.
   */
  private async verifyEventAccess(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isOrganizer = event.organizerId === userId;
    const isMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!isOrganizer && !isMember) {
      throw new ForbiddenException(
        'You must be a member or organizer of this event to access task assignments',
      );
    }

    return { event, isOrganizer };
  }

  /**
   * 1. Assign Member to Task
   * POST /tasks/:taskId/assignments
   */
  async assignMemberToTask(
    taskId: string,
    userId: string,
    assignDto: AssignMemberDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (
      task.team.event.status === EventStatus.Completed ||
      task.team.event.status === EventStatus.Archived ||
      task.team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify task assignments in a completed, archived, or cancelled event',
      );
    }

    const assignerMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: task.team.eventId,
          userId,
        },
      },
      include: {
        teamMembership: true,
      },
    });

    if (!assignerMember) {
      throw new ForbiddenException('You are not a member of this event');
    }

    const isOrganizer = task.team.event.organizerId === userId;
    const isTeamLeader =
      !!task.team.leaderMembershipId &&
      !!assignerMember.teamMembership &&
      task.team.leaderMembershipId === assignerMember.teamMembership.teamMembershipId;

    if (!isOrganizer && !isTeamLeader) {
      throw new ForbiddenException(
        'Only the event organizer or team leader of this team can assign tasks',
      );
    }

    const teamMembership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId: assignDto.teamMembershipId },
      include: {
        eventMember: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!teamMembership) {
      throw new NotFoundException('Team membership not found');
    }

    if (teamMembership.teamId !== task.teamId) {
      throw new BadRequestException(
        'Member does not belong to the same team as the task',
      );
    }

    const existingAssignment = await this.prisma.taskAssignment.findUnique({
      where: {
        taskId_teamMembershipId: {
          taskId,
          teamMembershipId: assignDto.teamMembershipId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('This member is already assigned to this task');
    }

    const existingCount = await this.prisma.taskAssignment.count({
      where: { taskId },
    });

    if (existingCount >= 3) {
      throw new BadRequestException(
        'Task already has the maximum allowed assignees (3)',
      );
    }

    const created = await this.prisma.taskAssignment.create({
      data: {
        taskId,
        teamMembershipId: assignDto.teamMembershipId,
        assignedByMemberId: assignerMember.eventMemberId,
        assignmentStatus: AssignmentStatus.Assigned,
        assignedAt: new Date(),
      },
      include: {
        task: true,
        teamMembership: {
          include: {
            eventMember: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhotoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const assignerUser = await this.prisma.user.findUnique({
      where: { userId },
      select: { firstName: true, lastName: true },
    });
    const assignerName = assignerUser
      ? `${assignerUser.firstName} ${assignerUser.lastName}`.trim()
      : 'Team Lead';

    this.notificationService.createTaskAssignedNotification(
      created.teamMembership.eventMemberId,
      task.taskId,
      task.taskTitle,
      assignerName,
    ).catch(() => {});

    return created;
  }

  /**
   * 2. Get Task Assignments
   * GET /tasks/:taskId/assignments
   */
  async getTaskAssignments(
    taskId: string,
    userId: string,
  ): Promise<TaskAssigneeItem[]> {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
      include: {
        team: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyEventAccess(task.team.eventId, userId);

    const assignments = await this.prisma.taskAssignment.findMany({
      where: { taskId },
      include: {
        teamMembership: {
          include: {
            eventMember: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhotoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const items: TaskAssigneeItem[] = assignments.map((a) => {
      const isLeader = task.team.leaderMembershipId === a.teamMembershipId;
      const userObj = {
        userId: a.teamMembership.eventMember.user.userId,
        firstName: a.teamMembership.eventMember.user.firstName,
        lastName: a.teamMembership.eventMember.user.lastName,
        email: a.teamMembership.eventMember.user.email,
        profilePhotoUrl: a.teamMembership.eventMember.user.profilePhotoUrl,
      };

      return {
        taskAssignmentId: a.taskAssignmentId,
        teamMembershipId: a.teamMembershipId,
        eventMemberId: a.teamMembership.eventMemberId,
        userId: a.teamMembership.eventMember.user.userId,
        assignmentStatus: a.assignmentStatus,
        assignedAt: a.assignedAt,
        completedAt: a.completedAt,
        firstName: a.teamMembership.eventMember.user.firstName,
        lastName: a.teamMembership.eventMember.user.lastName,
        email: a.teamMembership.eventMember.user.email,
        profilePhotoUrl: a.teamMembership.eventMember.user.profilePhotoUrl,
        isLeader,
        user: userObj,
        teamMembership: {
          teamMembershipId: a.teamMembershipId,
          eventMemberId: a.teamMembership.eventMemberId,
          eventMember: {
            eventMemberId: a.teamMembership.eventMemberId,
            userId: a.teamMembership.eventMember.user.userId,
            user: userObj,
          },
        },
      };
    });

    // Sort: Leader first, then alphabetical
    items.sort((a, b) => {
      if (a.isLeader && !b.isLeader) return -1;
      if (!a.isLeader && b.isLeader) return 1;

      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return items;
  }

  /**
   * 3. Get Assignment Details
   * GET /task-assignments/:id
   */
  async getAssignmentDetails(
    assignmentId: string,
    userId: string,
  ): Promise<AssignmentDetailsResponse> {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskAssignmentId: assignmentId },
      include: {
        task: {
          include: {
            team: {
              include: {
                event: true,
              },
            },
          },
        },
        teamMembership: {
          include: {
            eventMember: {
              include: {
                user: {
                  select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePhotoUrl: true,
                  },
                },
              },
            },
          },
        },
        assignedBy: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Task assignment not found');
    }

    const isOrganizer = assignment.task.team.event.organizerId === userId;
    const isAssignedMember = assignment.teamMembership.eventMember.userId === userId;

    const userEventMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: assignment.task.team.eventId,
          userId,
        },
      },
      include: {
        teamMembership: true,
      },
    });

    const isTeamLeader =
      !!assignment.task.team.leaderMembershipId &&
      !!userEventMember?.teamMembership &&
      assignment.task.team.leaderMembershipId === userEventMember.teamMembership.teamMembershipId;

    if (!isOrganizer && !isAssignedMember && !isTeamLeader) {
      throw new ForbiddenException(
        'You do not have access to view this assignment details',
      );
    }

    return {
      taskAssignmentId: assignment.taskAssignmentId,
      assignmentStatus: assignment.assignmentStatus,
      assignedAt: assignment.assignedAt,
      completedAt: assignment.completedAt,
      task: {
        taskId: assignment.task.taskId,
        taskTitle: assignment.task.taskTitle,
        description: assignment.task.description,
        priority: assignment.task.priority,
        status: assignment.task.status,
        dueDate: assignment.task.dueDate,
        teamId: assignment.task.teamId,
        teamName: assignment.task.team.teamName,
      },
      member: {
        teamMembershipId: assignment.teamMembership.teamMembershipId,
        eventMemberId: assignment.teamMembership.eventMemberId,
        user: assignment.teamMembership.eventMember.user,
      },
      assignedBy: {
        eventMemberId: assignment.assignedBy.eventMemberId,
        user: assignment.assignedBy.user,
      },
    };
  }

  /**
   * 4. Update Assignment Status
   * PATCH /task-assignments/:id/status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    userId: string,
    updateDto: UpdateAssignmentStatusDto,
  ) {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskAssignmentId: assignmentId },
      include: {
        task: {
          include: {
            team: {
              include: {
                event: true,
              },
            },
          },
        },
        teamMembership: {
          include: {
            eventMember: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Task assignment not found');
    }

    if (
      assignment.task.team.event.status === EventStatus.Completed ||
      assignment.task.team.event.status === EventStatus.Archived ||
      assignment.task.team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify task assignments in a completed, archived, or cancelled event',
      );
    }

    const isAssignedMember = assignment.teamMembership.eventMember.userId === userId;
    const isOrganizer = assignment.task.team.event.organizerId === userId;

    const userEventMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: assignment.task.team.eventId,
          userId,
        },
      },
      include: {
        teamMembership: true,
      },
    });

    const isTeamLeader =
      !!assignment.task.team.leaderMembershipId &&
      !!userEventMember?.teamMembership &&
      assignment.task.team.leaderMembershipId === userEventMember.teamMembership.teamMembershipId;

    if (!isAssignedMember && !isOrganizer && !isTeamLeader) {
      throw new ForbiddenException(
        'Only the assigned member, team leader, or organizer can update assignment status',
      );
    }

    const newCompletedAt =
      updateDto.assignmentStatus === AssignmentStatus.Completed
        ? new Date()
        : updateDto.assignmentStatus === AssignmentStatus.Assigned
          ? null
          : assignment.completedAt;

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.taskAssignment.update({
        where: { taskAssignmentId: assignmentId },
        data: {
          assignmentStatus: updateDto.assignmentStatus,
          completedAt: newCompletedAt,
        },
      });
    });

    // Notify organizer and team leader of progress update
    let updaterName = 'A team member';
    if (this.prisma.user?.findUnique) {
      try {
        const updaterUser = await this.prisma.user.findUnique({
          where: { userId },
          select: { firstName: true, lastName: true },
        });
        if (updaterUser) {
          updaterName = `${updaterUser.firstName} ${updaterUser.lastName}`.trim();
        }
      } catch {}
    }

    if (this.notificationService?.createTaskStatusUpdatedNotification) {
      this.notificationService.createTaskStatusUpdatedNotification(
        assignment.task.taskId,
        assignment.task.taskTitle,
        updateDto.assignmentStatus,
        assignment.task.team.eventId,
        assignment.task.teamId,
        userId,
        updaterName,
      ).catch(() => {});
    }

    return updated;
  }

  /**
   * 5. Remove Assignment
   * DELETE /task-assignments/:id
   */
  async removeAssignment(assignmentId: string, userId: string): Promise<void> {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskAssignmentId: assignmentId },
      include: {
        task: {
          include: {
            team: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Task assignment not found');
    }

    if (
      assignment.task.team.event.status === EventStatus.Completed ||
      assignment.task.team.event.status === EventStatus.Archived ||
      assignment.task.team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify task assignments in a completed, archived, or cancelled event',
      );
    }

    const isOrganizer = assignment.task.team.event.organizerId === userId;

    const userEventMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: assignment.task.team.eventId,
          userId,
        },
      },
      include: {
        teamMembership: true,
      },
    });

    const isTeamLeader =
      !!assignment.task.team.leaderMembershipId &&
      !!userEventMember?.teamMembership &&
      assignment.task.team.leaderMembershipId === userEventMember.teamMembership.teamMembershipId;

    if (!isOrganizer && !isTeamLeader) {
      throw new ForbiddenException(
        'Only the event organizer or team leader can remove task assignments',
      );
    }

    await this.prisma.taskAssignment.delete({
      where: { taskAssignmentId: assignmentId },
    });
  }

  /**
   * 6. Get My Assigned Tasks
   * GET /task-assignments/my
   */
  async getMyAssignedTasks(userId: string): Promise<MyAssignmentListItem[]> {
    const assignments = await this.prisma.taskAssignment.findMany({
      where: {
        teamMembership: {
          eventMember: {
            userId,
          },
        },
      },
      include: {
        task: {
          include: {
            team: {
              select: {
                teamId: true,
                teamName: true,
              },
            },
          },
        },
      },
      orderBy: [{ assignmentStatus: 'asc' }, { assignedAt: 'desc' }],
    });

    return assignments.map((a) => ({
      taskAssignmentId: a.taskAssignmentId,
      assignmentStatus: a.assignmentStatus,
      assignedAt: a.assignedAt,
      completedAt: a.completedAt,
      task: {
        taskId: a.task.taskId,
        taskTitle: a.task.taskTitle,
        description: a.task.description,
        priority: a.task.priority,
        status: a.task.status,
        dueDate: a.task.dueDate,
        team: {
          teamId: a.task.team.teamId,
          teamName: a.task.team.teamName,
        },
      },
    }));
  }

  /**
   * 7. Get Assignments by Member
   * GET /team-memberships/:teamMembershipId/assignments
   */
  async getAssignmentsByMember(
    teamMembershipId: string,
    userId: string,
  ): Promise<MemberAssignmentListItem[]> {
    const teamMembership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
        eventMember: true,
      },
    });

    if (!teamMembership) {
      throw new NotFoundException('Team membership not found');
    }

    const isOrganizer = teamMembership.team.event.organizerId === userId;
    const isOwner = teamMembership.eventMember.userId === userId;

    const userEventMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: teamMembership.team.eventId,
          userId,
        },
      },
      include: {
        teamMembership: true,
      },
    });

    const isTeamLeader =
      !!teamMembership.team.leaderMembershipId &&
      !!userEventMember?.teamMembership &&
      teamMembership.team.leaderMembershipId === userEventMember.teamMembership.teamMembershipId;

    if (!isOrganizer && !isOwner && !isTeamLeader) {
      throw new ForbiddenException(
        'You do not have access to view this member assignments',
      );
    }

    const assignments = await this.prisma.taskAssignment.findMany({
      where: { teamMembershipId },
      include: {
        task: true,
      },
      orderBy: [{ assignmentStatus: 'asc' }, { assignedAt: 'desc' }],
    });

    return assignments.map((a) => ({
      taskAssignmentId: a.taskAssignmentId,
      assignmentStatus: a.assignmentStatus,
      assignedAt: a.assignedAt,
      completedAt: a.completedAt,
      task: {
        taskId: a.task.taskId,
        taskTitle: a.task.taskTitle,
        priority: a.task.priority,
        status: a.task.status,
        dueDate: a.task.dueDate,
      },
    }));
  }

  /**
   * 8. Get Assignment Statistics
   * GET /events/:eventId/assignment-statistics
   */
  async getAssignmentStatistics(
    eventId: string,
    userId: string,
  ): Promise<AssignmentStatisticsResponse> {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can view assignment statistics',
      );
    }

    const allMembers = await this.prisma.teamMembership.findMany({
      where: {
        team: {
          eventId,
        },
      },
      select: {
        teamMembershipId: true,
      },
    });

    const totalMembers = allMembers.length;

    const assignments = await this.prisma.taskAssignment.findMany({
      where: {
        task: {
          team: {
            eventId,
          },
        },
      },
      select: {
        taskAssignmentId: true,
        teamMembershipId: true,
        assignmentStatus: true,
      },
    });

    const totalAssignments = assignments.length;
    const assigned = assignments.filter((a) => a.assignmentStatus === AssignmentStatus.Assigned).length;
    const inProgress = assignments.filter((a) => a.assignmentStatus === AssignmentStatus.InProgress).length;
    const completed = assignments.filter((a) => a.assignmentStatus === AssignmentStatus.Completed).length;

    const assignmentCountsByMember = new Map<string, number>();
    for (const m of allMembers) {
      assignmentCountsByMember.set(m.teamMembershipId, 0);
    }

    for (const a of assignments) {
      const current = assignmentCountsByMember.get(a.teamMembershipId) || 0;
      assignmentCountsByMember.set(a.teamMembershipId, current + 1);
    }

    let membersWithNoAssignments = 0;
    let overloadedMembers = 0;

    assignmentCountsByMember.forEach((count) => {
      if (count === 0) membersWithNoAssignments++;
      if (count >= 3) overloadedMembers++;
    });

    const averageAssignmentsPerMember =
      totalMembers > 0 ? Number((totalAssignments / totalMembers).toFixed(2)) : 0;

    return {
      totalAssignments,
      assigned,
      inProgress,
      completed,
      averageAssignmentsPerMember,
      membersWithNoAssignments,
      overloadedMembers,
    };
  }
}
