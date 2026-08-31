import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import {
  EventTaskListItem,
  TaskDetailsResponse,
  TaskStatisticsResponse,
} from './interfaces/task-response.interface';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * Helper: Verify user has permission to modify tasks for a team.
   * Only Organizer or Team Leader of the specified team may modify tasks.
   * Also verifies Event status is not Completed, Archived, or Cancelled.
   */
  private async verifyTeamAndPermissions(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: {
        event: true,
        leader: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (
      team.event.status === EventStatus.Completed ||
      team.event.status === EventStatus.Archived ||
      team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify tasks in a completed, archived, or cancelled event',
      );
    }

    const eventMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: team.eventId,
          userId,
        },
      },
      include: {
        user: true,
        teamMembership: true,
      },
    });

    if (!eventMember) {
      throw new ForbiddenException('You are not a member of this event');
    }

    const isOrganizer = team.event.organizerId === userId;
    const isTeamLeader =
      !!team.leaderMembershipId &&
      !!eventMember.teamMembership &&
      team.leaderMembershipId === eventMember.teamMembership.teamMembershipId;

    if (!isOrganizer && !isTeamLeader) {
      throw new ForbiddenException(
        'Only the event organizer or team leader of this team can modify tasks',
      );
    }

    return { team, eventMember, isOrganizer, isTeamLeader };
  }

  /**
   * Helper: Verify user is organizer or member of the event for read operations.
   */
  private async verifyEventReadAccess(eventId: string, userId: string) {
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
        'You must be a member or organizer of this event to view tasks',
      );
    }

    return { event, isOrganizer };
  }

  /**
   * 1. Create Task
   * POST /teams/:teamId/tasks
   */
  async createTask(teamId: string, userId: string, createTaskDto: CreateTaskDto) {
    const { eventMember } = await this.verifyTeamAndPermissions(teamId, userId);
    const assignerName = eventMember.user
      ? `${eventMember.user.firstName} ${eventMember.user.lastName}`.trim()
      : 'Team Lead';

    const assignedEventMemberIds: string[] = [];

    const result = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          teamId,
          createdByMemberId: eventMember.eventMemberId,
          taskTitle: createTaskDto.taskTitle,
          description: createTaskDto.description || null,
          priority: createTaskDto.priority || TaskPriority.Medium,
          status: TaskStatus.Pending,
          dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        },
        include: {
          team: {
            select: {
              teamId: true,
              teamName: true,
              eventId: true,
            },
          },
        },
      });

      if (
        createTaskDto.assignedMembershipIds &&
        Array.isArray(createTaskDto.assignedMembershipIds) &&
        createTaskDto.assignedMembershipIds.length > 0
      ) {
        // Max 3 assignees
        const targetIds = Array.from(new Set(createTaskDto.assignedMembershipIds)).slice(0, 3);
        for (const membershipId of targetIds) {
          const membership = await tx.teamMembership.findUnique({
            where: { teamMembershipId: membershipId },
          });
          if (membership && membership.teamId === teamId) {
            await tx.taskAssignment.create({
              data: {
                taskId: task.taskId,
                teamMembershipId: membershipId,
                assignedByMemberId: eventMember.eventMemberId,
                assignmentStatus: 'Assigned',
              },
            });
            assignedEventMemberIds.push(membership.eventMemberId);
          }
        }
      }

      return tx.task.findUnique({
        where: { taskId: task.taskId },
        include: {
          team: {
            select: {
              teamId: true,
              teamName: true,
              eventId: true,
            },
          },
          assignments: {
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
          },
        },
      });
    });

    if (result && assignedEventMemberIds.length > 0) {
      for (const targetMemberId of assignedEventMemberIds) {
        this.notificationService.createTaskAssignedNotification(
          targetMemberId,
          result.taskId,
          result.taskTitle,
          assignerName,
        ).catch(() => {});
      }
    }

    return result;
  }

  /**
   * 2. Get Team Tasks
   * GET /teams/:teamId/tasks
   */
  async getTeamTasks(teamId: string, userId: string, filterDto: TaskFilterDto) {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const { isOrganizer } = await this.verifyEventReadAccess(team.eventId, userId);

    if (!isOrganizer) {
      const eventMember = await this.prisma.eventMember.findUnique({
        where: {
          eventId_userId: {
            eventId: team.eventId,
            userId,
          },
        },
        include: {
          teamMembership: true,
        },
      });

      if (!eventMember?.teamMembership || eventMember.teamMembership.teamId !== teamId) {
        throw new ForbiddenException('You can only view tasks for your own team');
      }
    }

    const searchKeyword = filterDto.search || filterDto.keyword;

    const whereClause: any = {
      teamId,
      ...(filterDto.status && { status: filterDto.status }),
      ...(filterDto.priority && { priority: filterDto.priority }),
    };

    if (searchKeyword) {
      whereClause.OR = [
        { taskTitle: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    if (filterDto.dueBefore || filterDto.dueAfter) {
      whereClause.dueDate = {
        ...(filterDto.dueBefore && { lte: new Date(filterDto.dueBefore) }),
        ...(filterDto.dueAfter && { gte: new Date(filterDto.dueAfter) }),
      };
    }

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        assignments: {
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
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 3. Get Event Tasks
   * GET /events/:eventId/tasks
   */
  async getEventTasks(
    eventId: string,
    userId: string,
  ): Promise<EventTaskListItem[]> {
    const { isOrganizer } = await this.verifyEventReadAccess(eventId, userId);

    const whereClause: any = {
      team: {
        eventId,
      },
    };

    if (!isOrganizer) {
      const eventMember = await this.prisma.eventMember.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        include: {
          teamMembership: true,
        },
      });

      if (!eventMember?.teamMembership?.teamId) {
        return [];
      }

      whereClause.teamId = eventMember.teamMembership.teamId;
    }

    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: {
        team: {
          select: {
            teamName: true,
          },
        },
        assignments: {
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
        },
        createdBy: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map((task) => ({
      taskId: task.taskId,
      teamId: task.teamId,
      teamName: task.team.teamName,
      taskTitle: task.taskTitle,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      creatorName: `${task.createdBy.user.firstName} ${task.createdBy.user.lastName}`,
      assignments: task.assignments,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  /**
   * 4. Get Task Details
   * GET /tasks/:taskId
   */
  async getTaskDetails(taskId: string, userId: string): Promise<TaskDetailsResponse> {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
      include: {
        team: {
          include: {
            leader: {
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
            event: {
              select: {
                eventId: true,
                eventName: true,
                status: true,
                organizerId: true,
              },
            },
          },
        },
        createdBy: {
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
        assignments: {
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
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { isOrganizer } = await this.verifyEventReadAccess(task.team.eventId, userId);

    if (!isOrganizer) {
      const eventMember = await this.prisma.eventMember.findUnique({
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

      if (!eventMember?.teamMembership || eventMember.teamMembership.teamId !== task.teamId) {
        throw new ForbiddenException('You can only view tasks for your own team');
      }
    }

    const completedAssignmentCount = await this.prisma.taskAssignment.count({
      where: {
        taskId,
        assignmentStatus: 'Completed',
      },
    });

    return {
      taskId: task.taskId,
      teamId: task.teamId,
      createdByMemberId: task.createdByMemberId,
      taskTitle: task.taskTitle,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      team: {
        teamId: task.team.teamId,
        teamName: task.team.teamName,
        description: task.team.description,
        eventId: task.team.eventId,
        leaderMembershipId: task.team.leaderMembershipId,
        leader: task.team.leader as any,
      },
      event: {
        eventId: task.team.event.eventId,
        eventName: task.team.event.eventName,
        status: task.team.event.status,
        organizerId: task.team.event.organizerId,
      },
      createdBy: {
        eventMemberId: task.createdBy.eventMemberId,
        userId: task.createdBy.user.userId,
        firstName: task.createdBy.user.firstName,
        lastName: task.createdBy.user.lastName,
        email: task.createdBy.user.email,
        profilePhotoUrl: task.createdBy.user.profilePhotoUrl,
      },
      assignmentCount: task._count.assignments,
      completedAssignmentCount,
      assignments: task.assignments as any,
    };
  }

  /**
   * 5. Update Task
   * PATCH /tasks/:taskId
   */
  async updateTask(taskId: string, userId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
      include: {
        team: {
          include: {
            event: true,
            leader: {
              include: {
                eventMember: true,
              },
            },
          },
        },
        assignments: {
          include: {
            teamMembership: {
              include: {
                eventMember: true,
              },
            },
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
        'Cannot modify tasks in a completed, archived, or cancelled event',
      );
    }

    const isOrganizer = task.team.event.organizerId === userId;
    const isLeader = task.team.leader?.eventMember?.userId === userId;
    const isAssignee = task.assignments.some(
      (a) => a.teamMembership?.eventMember?.userId === userId,
    );

    if (!isOrganizer && !isLeader && !isAssignee) {
      throw new ForbiddenException(
        'Only the event organizer, team leader, or assigned team member can update this task',
      );
    }

    return this.prisma.task.update({
      where: { taskId },
      data: {
        ...(updateTaskDto.taskTitle !== undefined && { taskTitle: updateTaskDto.taskTitle }),
        ...(updateTaskDto.description !== undefined && { description: updateTaskDto.description }),
        ...(updateTaskDto.priority !== undefined && { priority: updateTaskDto.priority }),
        ...(updateTaskDto.dueDate !== undefined && {
          dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
        }),
      },
      include: {
        assignments: {
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
        },
      },
    });
  }

  /**
   * 6. Update Task Status
   * PATCH /tasks/:taskId/status
   */
  async updateTaskStatus(
    taskId: string,
    userId: string,
    updateStatusDto: UpdateTaskStatusDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
      include: {
        team: {
          include: {
            event: true,
            leader: {
              include: {
                eventMember: true,
              },
            },
          },
        },
        assignments: {
          include: {
            teamMembership: {
              include: {
                eventMember: true,
              },
            },
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
        'Cannot modify tasks in a completed, archived, or cancelled event',
      );
    }

    // Verify user is organizer, team leader, or assigned member of this task
    const isOrganizer = task.team.event.organizerId === userId;
    const isLeader = task.team.leader?.eventMember?.userId === userId;
    const isAssignee = task.assignments.some(
      (a) => a.teamMembership?.eventMember?.userId === userId,
    );

    if (!isOrganizer && !isLeader && !isAssignee) {
      throw new ForbiddenException(
        'Only the event organizer, team leader, or assigned member can update the status of this task',
      );
    }

    const updatedTask = await this.prisma.task.update({
      where: { taskId },
      data: {
        status: updateStatusDto.status,
      },
    });

    // Notify organizer and team leader when task status is changed
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
        task.taskId,
        task.taskTitle,
        updateStatusDto.status,
        task.team.eventId,
        task.teamId,
        userId,
        updaterName,
      ).catch(() => {});
    }

    return updatedTask;
  }

  /**
   * 7. Delete Task
   * DELETE /tasks/:taskId
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyTeamAndPermissions(task.teamId, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({
        where: { taskId },
      });
    });
  }

  /**
   * 8. Search Tasks
   * GET /tasks/search
   */
  async searchTasks(userId: string, filterDto: TaskFilterDto) {
    const searchKeyword = filterDto.search || filterDto.keyword;

    const whereClause: any = {};

    if (searchKeyword) {
      whereClause.OR = [
        { taskTitle: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    if (filterDto.priority) {
      whereClause.priority = filterDto.priority;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { eventId: filterDto.eventId },
      });

      if (event && event.organizerId === userId) {
        whereClause.team = { eventId: filterDto.eventId };
        if (filterDto.teamId) {
          whereClause.teamId = filterDto.teamId;
        }
      } else {
        const eventMember = await this.prisma.eventMember.findUnique({
          where: {
            eventId_userId: {
              eventId: filterDto.eventId,
              userId,
            },
          },
          include: { teamMembership: true },
        });

        if (!eventMember?.teamMembership?.teamId) {
          return [];
        }

        whereClause.teamId = eventMember.teamMembership.teamId;
      }
    } else if (filterDto.teamId) {
      const team = await this.prisma.team.findUnique({
        where: { teamId: filterDto.teamId },
        include: { event: true },
      });

      if (team) {
        if (team.event.organizerId === userId) {
          whereClause.teamId = filterDto.teamId;
        } else {
          const eventMember = await this.prisma.eventMember.findUnique({
            where: {
              eventId_userId: {
                eventId: team.eventId,
                userId,
              },
            },
            include: { teamMembership: true },
          });

          if (!eventMember?.teamMembership || eventMember.teamMembership.teamId !== filterDto.teamId) {
            return [];
          }
          whereClause.teamId = filterDto.teamId;
        }
      }
    } else {
      // Find events organized by user and teams user is member of
      const organizedEvents = await this.prisma.event.findMany({
        where: { organizerId: userId },
        select: { eventId: true },
      });
      const organizedEventIds = organizedEvents.map((e) => e.eventId);

      const memberships = await this.prisma.teamMembership.findMany({
        where: { eventMember: { userId } },
        select: { teamId: true },
      });
      const memberTeamIds = memberships.map((m) => m.teamId);

      whereClause.AND = [
        {
          OR: [
            ...(organizedEventIds.length > 0 ? [{ team: { eventId: { in: organizedEventIds } } }] : []),
            ...(memberTeamIds.length > 0 ? [{ teamId: { in: memberTeamIds } }] : []),
          ],
        },
      ];
    }

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        team: {
          select: {
            teamId: true,
            teamName: true,
            eventId: true,
          },
        },
        assignments: {
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
        },
        createdBy: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 9. Get My Team Tasks
   * GET /tasks/my-team
   */
  async getMyTeamTasks(userId: string, eventId?: string) {
    const memberships = await this.prisma.teamMembership.findMany({
      where: {
        eventMember: {
          userId,
          ...(eventId ? { eventId } : {}),
        },
      },
      select: {
        teamId: true,
      },
    });

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const teamIds = memberships.map((m) => m.teamId);

    return this.prisma.task.findMany({
      where: {
        teamId: {
          in: teamIds,
        },
      },
      include: {
        team: {
          select: {
            teamId: true,
            teamName: true,
            eventId: true,
          },
        },
        assignments: {
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
        },
        createdBy: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 10. Get Task Statistics
   * GET /events/:eventId/task-statistics
   */
  async getTaskStatistics(
    eventId: string,
    userId: string,
  ): Promise<TaskStatisticsResponse> {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can view task statistics');
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        team: {
          eventId,
        },
      },
      select: {
        status: true,
        priority: true,
      },
    });

    const totalTasks = tasks.length;
    const pending = tasks.filter((t) => t.status === TaskStatus.Pending).length;
    const inProgress = tasks.filter((t) => t.status === TaskStatus.InProgress).length;
    const completed = tasks.filter((t) => t.status === TaskStatus.Completed).length;
    const onHold = tasks.filter((t) => t.status === TaskStatus.OnHold).length;
    const cancelled = tasks.filter((t) => t.status === TaskStatus.Cancelled).length;
    const overdue = tasks.filter((t) => t.status === TaskStatus.Overdue).length;

    const highPriorityCount = tasks.filter(
      (t) => t.priority === TaskPriority.High,
    ).length;
    const criticalPriorityCount = tasks.filter(
      (t) => t.priority === TaskPriority.Critical,
    ).length;

    return {
      totalTasks,
      pending,
      inProgress,
      completed,
      onHold,
      cancelled,
      overdue,
      highPriorityCount,
      criticalPriorityCount,
    };
  }
}
