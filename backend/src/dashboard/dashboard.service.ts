import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignmentStatus,
  TaskPriority,
  TaskStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MyNotificationsFilterDto } from './dto/my-notifications-filter.dto';
import { MyTasksFilterDto } from './dto/my-tasks-filter.dto';
import {
  CriticalTask,
  DashboardStatisticsResponse,
  EventSummaryWidget,
  MemberDashboardResponse,
  MemberHighPriorityTask,
  MemberNotificationItem,
  MemberProfileWidget,
  MemberProgressWidget,
  MemberTaskSummaryWidget,
  MemberUpcomingDeadlineTask,
  NotificationSummaryWidget,
  OrganizerDashboardResponse,
  PaginatedAssignedTasksResponse,
  PaginatedNotificationsResponse,
  TaskAnalyticsResponse,
  TaskSummaryWidget,
  TeamAnalyticsItem,
  TeamSummaryWidget,
  TimelineActivityItem,
  UpcomingDeadlineTask,
} from './interfaces/dashboard-responses.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Verify user is organizer of the given event.
   * Throws NotFoundException if event does not exist.
   * Throws ForbiddenException if user is not the organizer.
   */
  async verifyOrganizerAccess(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can access this dashboard',
      );
    }

    return event;
  }

  /**
   * GET /dashboard/events/:eventId
   * Organizer Dashboard: Return one comprehensive dashboard response.
   */
  async getOrganizerDashboard(
    eventId: string,
    userId: string,
  ): Promise<OrganizerDashboardResponse> {
    const event = await this.verifyOrganizerAccess(eventId, userId);
    const now = new Date();

    const [
      totalTeams,
      totalMembers,
      tasks,
      totalTaskAssignments,
      teams,
      upcomingDeadlinesData,
      criticalTasksData,
      totalNotifications,
      unreadNotifications,
      readNotifications,
      recentEventMembers,
      recentTasks,
      recentAssignments,
    ] = await Promise.all([
      // 1. Total Teams count
      this.prisma.team.count({ where: { eventId } }),

      // 2. Total Event Members count
      this.prisma.eventMember.count({ where: { eventId } }),

      // 3. All tasks of event
      this.prisma.task.findMany({
        where: { team: { eventId } },
        select: {
          taskId: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      }),

      // 4. Total Task Assignments
      this.prisma.taskAssignment.count({
        where: { task: { team: { eventId } } },
      }),

      // 5. Teams details with member and task metrics
      this.prisma.team.findMany({
        where: { eventId },
        include: {
          leader: {
            include: {
              eventMember: {
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
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
          tasks: {
            select: {
              status: true,
            },
          },
        },
      }),

      // 6. Upcoming deadlines (next 10 tasks)
      this.prisma.task.findMany({
        where: {
          team: { eventId },
          dueDate: { not: null },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: {
          team: {
            select: { teamName: true },
          },
        },
      }),

      // 7. Critical / High priority incomplete tasks
      this.prisma.task.findMany({
        where: {
          team: { eventId },
          priority: { in: [TaskPriority.Critical, TaskPriority.High] },
          status: { not: TaskStatus.Completed },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 10,
        include: {
          team: {
            select: { teamName: true },
          },
        },
      }),

      // 8. Total notifications count
      this.prisma.notification.count({
        where: {
          OR: [{ relatedEventId: eventId }, { eventMember: { eventId } }],
        },
      }),

      // 9. Unread notifications count
      this.prisma.notification.count({
        where: {
          OR: [{ relatedEventId: eventId }, { eventMember: { eventId } }],
          isRead: false,
        },
      }),

      // 10. Read notifications count
      this.prisma.notification.count({
        where: {
          OR: [{ relatedEventId: eventId }, { eventMember: { eventId } }],
          isRead: true,
        },
      }),

      // 11. Recent member joins for activity derivation
      this.prisma.eventMember.findMany({
        where: { eventId },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // 12. Recent tasks created for activity derivation
      this.prisma.task.findMany({
        where: { team: { eventId } },
        select: {
          taskId: true,
          taskTitle: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // 13. Recent assignments updated / created for activity derivation
      this.prisma.taskAssignment.findMany({
        where: { task: { team: { eventId } } },
        include: {
          task: { select: { taskTitle: true } },
          teamMembership: {
            include: {
              eventMember: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    // Calculate Days Remaining
    const diffMs = event.endDate.getTime() - now.getTime();
    const daysRemaining =
      diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

    const eventSummary: EventSummaryWidget = {
      eventName: event.eventName,
      status: event.status,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      daysRemaining,
      totalTeams,
      totalMembers,
      totalTasks: tasks.length,
      totalTaskAssignments,
    };

    // Calculate Task Summary counts & percentages
    const totalTasksCount = tasks.length;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let onHoldTasks = 0;
    let overdueTasks = 0;
    let cancelledTasks = 0;

    for (const t of tasks) {
      if (t.status === TaskStatus.Pending) pendingTasks++;
      else if (t.status === TaskStatus.InProgress) inProgressTasks++;
      else if (t.status === TaskStatus.Completed) completedTasks++;
      else if (t.status === TaskStatus.OnHold) onHoldTasks++;
      else if (t.status === TaskStatus.Overdue) overdueTasks++;
      else if (t.status === TaskStatus.Cancelled) cancelledTasks++;

      // Check if task is overdue by date if status is not completed/cancelled
      if (
        t.status !== TaskStatus.Completed &&
        t.status !== TaskStatus.Cancelled &&
        t.dueDate &&
        t.dueDate < now &&
        t.status !== TaskStatus.Overdue
      ) {
        overdueTasks++;
      }
    }

    const completedPercentage =
      totalTasksCount > 0
        ? Number(((completedTasks / totalTasksCount) * 100).toFixed(1))
        : 0;

    const taskSummary: TaskSummaryWidget = {
      pendingTasks,
      inProgressTasks,
      completedTasks,
      onHoldTasks,
      overdueTasks,
      cancelledTasks,
      completedPercentage,
    };

    // Map Teams Summary
    const teamSummaryList: TeamSummaryWidget[] = teams.map((team) => {
      const leaderName = team.leader
        ? `${team.leader.eventMember.user.firstName} ${team.leader.eventMember.user.lastName}`
        : null;
      const teamTaskCount = team._count.tasks;
      const teamCompletedTasks = team.tasks.filter(
        (t) => t.status === TaskStatus.Completed,
      ).length;
      const teamPendingTasks = team.tasks.filter(
        (t) => t.status === TaskStatus.Pending,
      ).length;
      const teamCompletionPercentage =
        teamTaskCount > 0
          ? Number(((teamCompletedTasks / teamTaskCount) * 100).toFixed(1))
          : 0;

      return {
        teamName: team.teamName,
        leaderName,
        memberCount: team._count.members,
        totalTasks: teamTaskCount,
        completedTasks: teamCompletedTasks,
        pendingTasks: teamPendingTasks,
        completionPercentage: teamCompletionPercentage,
      };
    });

    // Sort teams by completion percentage descending
    teamSummaryList.sort(
      (a, b) => b.completionPercentage - a.completionPercentage,
    );

    // Map Upcoming Deadlines
    const upcomingDeadlines: UpcomingDeadlineTask[] = upcomingDeadlinesData.map(
      (t) => ({
        taskId: t.taskId,
        taskTitle: t.taskTitle,
        team: t.team.teamName,
        priority: t.priority,
        dueDate: t.dueDate,
        status: t.status,
      }),
    );

    // Map Critical Tasks
    const criticalTasks: CriticalTask[] = criticalTasksData.map((t) => ({
      taskId: t.taskId,
      taskTitle: t.taskTitle,
      team: t.team.teamName,
      priority: t.priority,
      dueDate: t.dueDate,
      status: t.status,
    }));

    // Derive Recent Activities
    const activities: TimelineActivityItem[] = [];

    // Event Created
    activities.push({
      type: 'EventCreated',
      description: `Event "${event.eventName}" created`,
      timestamp: event.createdAt,
      relatedId: event.eventId,
    });

    // Teams Created
    for (const team of teams) {
      activities.push({
        type: 'TeamCreated',
        description: `Team "${team.teamName}" created`,
        timestamp: team.createdAt,
        relatedId: team.teamId,
      });
    }

    // Members Joined
    for (const member of recentEventMembers) {
      activities.push({
        type: 'MemberJoined',
        description: `${member.user.firstName} ${member.user.lastName} joined the event`,
        timestamp: member.joinedAt || member.createdAt,
        relatedId: member.eventMemberId,
      });
    }

    // Tasks Created
    for (const t of recentTasks) {
      activities.push({
        type: 'TaskCreated',
        description: `Task "${t.taskTitle}" created`,
        timestamp: t.createdAt,
        relatedId: t.taskId,
      });
    }

    // Task Assignments / Completion
    for (const a of recentAssignments) {
      const assigneeName = `${a.teamMembership.eventMember.user.firstName} ${a.teamMembership.eventMember.user.lastName}`;
      if (a.assignmentStatus === AssignmentStatus.Completed) {
        activities.push({
          type: 'AssignmentCompleted',
          description: `${assigneeName} completed task "${a.task.taskTitle}"`,
          timestamp: a.completedAt || a.updatedAt,
          relatedId: a.taskAssignmentId,
        });
      } else {
        activities.push({
          type: 'TaskAssigned',
          description: `Task "${a.task.taskTitle}" assigned to ${assigneeName}`,
          timestamp: a.assignedAt || a.createdAt,
          relatedId: a.taskAssignmentId,
        });
      }
    }

    // Sort activities descending by timestamp and limit to 20
    activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    const recentActivities = activities.slice(0, 20);

    const notificationSummary: NotificationSummaryWidget = {
      totalNotifications,
      unreadNotifications,
      readNotifications,
    };

    return {
      eventSummary,
      taskSummary,
      teamSummary: teamSummaryList,
      overallProgress: completedPercentage,
      upcomingDeadlines,
      criticalTasks,
      recentActivities,
      notificationSummary,
      teamProgress: teamSummaryList,
    };
  }

  /**
   * GET /dashboard/me
   * Member Dashboard: Return dashboard for logged-in member.
   */
  async getMemberDashboard(userId: string): Promise<MemberDashboardResponse> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch user event memberships with team memberships and events
    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      include: {
        event: {
          select: { eventId: true, eventName: true },
        },
        teamMembership: {
          include: {
            team: { select: { teamId: true, teamName: true } },
            leadingTeam: { select: { teamId: true } },
          },
        },
      },
    });

    const eventMemberIds = eventMembers.map((em) => em.eventMemberId);
    const teamMembershipIds = eventMembers
      .map((em) => em.teamMembership?.teamMembershipId)
      .filter((id): id is string => !!id);

    const teamNames = Array.from(
      new Set(
        eventMembers
          .map((em) => em.teamMembership?.team.teamName)
          .filter((name): name is string => !!name),
      ),
    );

    const eventNames = Array.from(
      new Set(eventMembers.map((em) => em.event.eventName)),
    );

    const isTeamLeader = eventMembers.some(
      (em) => !!em.teamMembership?.leadingTeam,
    );

    const profile: MemberProfileWidget = {
      firstName: user.firstName,
      lastName: user.lastName,
      team: teamNames.length > 0 ? teamNames.join(', ') : null,
      event: eventNames.length > 0 ? eventNames.join(', ') : null,
      isTeamLeader,
    };

    // Parallel fetch for assignments and notifications
    const [assignments, notificationsData] = await Promise.all([
      teamMembershipIds.length > 0
        ? this.prisma.taskAssignment.findMany({
            where: {
              teamMembershipId: { in: teamMembershipIds },
            },
            include: {
              task: {
                include: {
                  team: { select: { teamName: true } },
                },
              },
            },
            orderBy: [
              { task: { dueDate: 'asc' } },
              { createdAt: 'desc' },
            ],
          })
        : Promise.resolve([] as any[]),

      eventMemberIds.length > 0
        ? this.prisma.notification.findMany({
            where: {
              eventMemberId: { in: eventMemberIds },
            },
            orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
            take: 10,
          })
        : Promise.resolve([] as any[]),
    ]);

    // Task Summary grouping
    let assigned = 0;
    let inProgress = 0;
    let completed = 0;

    for (const a of assignments) {
      if (a.assignmentStatus === AssignmentStatus.Assigned) assigned++;
      else if (a.assignmentStatus === AssignmentStatus.InProgress) inProgress++;
      else if (a.assignmentStatus === AssignmentStatus.Completed) completed++;
    }

    const taskSummary: MemberTaskSummaryWidget = {
      assigned,
      inProgress,
      completed,
    };

    // My Upcoming Deadlines (next 10 assigned tasks)
    const upcomingDeadlines: MemberUpcomingDeadlineTask[] = assignments
      .filter((a) => a.assignmentStatus !== AssignmentStatus.Completed)
      .slice(0, 10)
      .map((a) => ({
        taskAssignmentId: a.taskAssignmentId,
        taskId: a.taskId,
        taskTitle: a.task.taskTitle,
        team: a.task.team.teamName,
        priority: a.task.priority,
        dueDate: a.task.dueDate,
        assignmentStatus: a.assignmentStatus,
      }));

    // My High Priority Tasks (Priority High or Critical and not completed)
    const highPriorityTasks: MemberHighPriorityTask[] = assignments
      .filter(
        (a) =>
          (a.task.priority === TaskPriority.High ||
            a.task.priority === TaskPriority.Critical) &&
          a.assignmentStatus !== AssignmentStatus.Completed,
      )
      .map((a) => ({
        taskAssignmentId: a.taskAssignmentId,
        taskId: a.taskId,
        taskTitle: a.task.taskTitle,
        team: a.task.team.teamName,
        priority: a.task.priority,
        dueDate: a.task.dueDate,
        assignmentStatus: a.assignmentStatus,
      }));

    // My Progress Widget
    const totalAssignments = assignments.length;
    const completedAssignments = completed;
    const completionPercentage =
      totalAssignments > 0
        ? Number(((completedAssignments / totalAssignments) * 100).toFixed(1))
        : 0;

    const progress: MemberProgressWidget = {
      completedAssignments,
      totalAssignments,
      completionPercentage,
    };

    const notifications: MemberNotificationItem[] = notificationsData.map(
      (n) => ({
        notificationId: n.notificationId,
        title: n.title,
        message: n.message,
        notificationType: n.notificationType,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }),
    );

    return {
      profile,
      taskSummary,
      upcomingDeadlines,
      highPriorityTasks,
      progress,
      notifications,
    };
  }

  /**
   * GET /dashboard/events/:eventId/statistics
   * Dashboard Statistics API (Organizer Only)
   */
  async getEventStatistics(
    eventId: string,
    userId: string,
  ): Promise<DashboardStatisticsResponse> {
    await this.verifyOrganizerAccess(eventId, userId);
    const now = new Date();

    const [teamsCount, membersCount, tasks] = await Promise.all([
      this.prisma.team.count({ where: { eventId } }),
      this.prisma.eventMember.count({ where: { eventId } }),
      this.prisma.task.findMany({
        where: { team: { eventId } },
        select: { status: true, dueDate: true },
      }),
    ]);

    const totalTasks = tasks.length;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    for (const t of tasks) {
      if (t.status === TaskStatus.Completed) completedTasks++;
      if (t.status === TaskStatus.Pending) pendingTasks++;
      if (
        t.status === TaskStatus.Overdue ||
        (t.dueDate &&
          t.dueDate < now &&
          t.status !== TaskStatus.Completed &&
          t.status !== TaskStatus.Cancelled)
      ) {
        overdueTasks++;
      }
    }

    const completionPercentage =
      totalTasks > 0
        ? Number(((completedTasks / totalTasks) * 100).toFixed(1))
        : 0;

    return {
      events: 1,
      teams: teamsCount,
      members: membersCount,
      tasks: totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionPercentage,
    };
  }

  /**
   * GET /dashboard/events/:eventId/team-analytics
   * Team Analytics API (Organizer Only)
   */
  async getTeamAnalytics(
    eventId: string,
    userId: string,
  ): Promise<TeamAnalyticsItem[]> {
    await this.verifyOrganizerAccess(eventId, userId);

    const teams = await this.prisma.team.findMany({
      where: { eventId },
      select: {
        teamId: true,
        teamName: true,
        _count: {
          select: { members: true, tasks: true },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { teamName: 'asc' },
    });

    return teams.map((team) => {
      const taskCount = team._count.tasks;
      const completedCount = team.tasks.filter(
        (t) => t.status === TaskStatus.Completed,
      ).length;
      const pendingCount = team.tasks.filter(
        (t) => t.status === TaskStatus.Pending,
      ).length;
      const progressPercentage =
        taskCount > 0
          ? Number(((completedCount / taskCount) * 100).toFixed(1))
          : 0;

      return {
        teamName: team.teamName,
        memberCount: team._count.members,
        taskCount,
        completedCount,
        pendingCount,
        progressPercentage,
      };
    });
  }

  /**
   * GET /dashboard/events/:eventId/task-analytics
   * Task Analytics API (Organizer Only)
   */
  async getTaskAnalytics(
    eventId: string,
    userId: string,
  ): Promise<TaskAnalyticsResponse> {
    await this.verifyOrganizerAccess(eventId, userId);
    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: { team: { eventId } },
      select: { status: true, dueDate: true },
    });

    let pending = 0;
    let inProgress = 0;
    let onHold = 0;
    let completed = 0;
    let cancelled = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === TaskStatus.Pending) pending++;
      else if (t.status === TaskStatus.InProgress) inProgress++;
      else if (t.status === TaskStatus.OnHold) onHold++;
      else if (t.status === TaskStatus.Completed) completed++;
      else if (t.status === TaskStatus.Cancelled) cancelled++;
      else if (t.status === TaskStatus.Overdue) overdue++;

      if (
        t.status !== TaskStatus.Completed &&
        t.status !== TaskStatus.Cancelled &&
        t.status !== TaskStatus.Overdue &&
        t.dueDate &&
        t.dueDate < now
      ) {
        overdue++;
      }
    }

    return {
      pending,
      inProgress,
      onHold,
      completed,
      cancelled,
      overdue,
    };
  }

  /**
   * GET /dashboard/events/:eventId/timeline
   * Chronological Activity Feed (Organizer Only, Max 50 records)
   */
  async getTimeline(
    eventId: string,
    userId: string,
  ): Promise<TimelineActivityItem[]> {
    const event = await this.verifyOrganizerAccess(eventId, userId);

    const [teams, recentMembers, recentTasks, recentAssignments] =
      await Promise.all([
        this.prisma.team.findMany({
          where: { eventId },
          select: { teamId: true, teamName: true, createdAt: true },
        }),
        this.prisma.eventMember.findMany({
          where: { eventId },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        this.prisma.task.findMany({
          where: { team: { eventId } },
          select: { taskId: true, taskTitle: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        this.prisma.taskAssignment.findMany({
          where: { task: { team: { eventId } } },
          include: {
            task: { select: { taskTitle: true } },
            teamMembership: {
              include: {
                eventMember: {
                  include: {
                    user: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 50,
        }),
      ]);

    const activities: TimelineActivityItem[] = [];

    // Event created
    activities.push({
      type: 'EventCreated',
      description: `Event "${event.eventName}" created`,
      timestamp: event.createdAt,
      relatedId: event.eventId,
    });

    // Teams created
    for (const team of teams) {
      activities.push({
        type: 'TeamCreated',
        description: `Team "${team.teamName}" created`,
        timestamp: team.createdAt,
        relatedId: team.teamId,
      });
    }

    // Members joined
    for (const m of recentMembers) {
      activities.push({
        type: 'MemberJoined',
        description: `${m.user.firstName} ${m.user.lastName} joined the event`,
        timestamp: m.joinedAt || m.createdAt,
        relatedId: m.eventMemberId,
      });
    }

    // Tasks created
    for (const t of recentTasks) {
      activities.push({
        type: 'TaskCreated',
        description: `Task "${t.taskTitle}" created`,
        timestamp: t.createdAt,
        relatedId: t.taskId,
      });
    }

    // Task assignments & completions
    for (const a of recentAssignments) {
      const assignee = `${a.teamMembership.eventMember.user.firstName} ${a.teamMembership.eventMember.user.lastName}`;
      if (a.assignmentStatus === AssignmentStatus.Completed) {
        activities.push({
          type: 'AssignmentCompleted',
          description: `${assignee} completed task "${a.task.taskTitle}"`,
          timestamp: a.completedAt || a.updatedAt,
          relatedId: a.taskAssignmentId,
        });
      } else {
        activities.push({
          type: 'TaskAssigned',
          description: `Task "${a.task.taskTitle}" assigned to ${assignee}`,
          timestamp: a.assignedAt || a.createdAt,
          relatedId: a.taskAssignmentId,
        });
      }
    }

    // Sort newest first & limit to 50
    activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return activities.slice(0, 50);
  }

  /**
   * GET /dashboard/me/tasks
   * Return all assignments belonging to logged-in member with filtering, search, sorting, and pagination.
   */
  async getMyTasks(
    userId: string,
    filterDto: MyTasksFilterDto,
  ): Promise<PaginatedAssignedTasksResponse> {
    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      select: {
        teamMembership: {
          select: { teamMembershipId: true },
        },
      },
    });

    const teamMembershipIds = eventMembers
      .map((em) => em.teamMembership?.teamMembershipId)
      .filter((id): id is string => !!id);

    if (teamMembershipIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        totalPages: 0,
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      teamMembershipId: { in: teamMembershipIds },
    };

    if (filterDto.status) {
      whereClause.assignmentStatus = filterDto.status;
    }

    if (filterDto.taskStatus || filterDto.priority || filterDto.search) {
      whereClause.task = {};

      if (filterDto.taskStatus) {
        whereClause.task.status = filterDto.taskStatus;
      }

      if (filterDto.priority) {
        whereClause.task.priority = filterDto.priority;
      }

      if (filterDto.search) {
        whereClause.task.OR = [
          { taskTitle: { contains: filterDto.search, mode: 'insensitive' } },
          { description: { contains: filterDto.search, mode: 'insensitive' } },
        ];
      }
    }

    const sortOrder = filterDto.sortOrder || 'asc';
    let orderBy: any = [{ createdAt: sortOrder }];

    if (filterDto.sortBy === 'dueDate') {
      orderBy = [{ task: { dueDate: sortOrder } }, { createdAt: sortOrder }];
    } else if (filterDto.sortBy === 'priority') {
      orderBy = [{ task: { priority: sortOrder } }, { createdAt: sortOrder }];
    } else if (filterDto.sortBy === 'status') {
      orderBy = [{ assignmentStatus: sortOrder }];
    }

    const [total, assignments] = await Promise.all([
      this.prisma.taskAssignment.count({ where: whereClause }),
      this.prisma.taskAssignment.findMany({
        where: whereClause,
        include: {
          task: {
            include: {
              team: {
                select: {
                  teamId: true,
                  teamName: true,
                  eventId: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const formattedData = assignments.map((a) => ({
      taskAssignmentId: a.taskAssignmentId,
      taskId: a.taskId,
      taskTitle: a.task.taskTitle,
      description: a.task.description,
      priority: a.task.priority,
      taskStatus: a.task.status,
      dueDate: a.task.dueDate,
      assignmentStatus: a.assignmentStatus,
      assignedAt: a.assignedAt,
      completedAt: a.completedAt,
      team: {
        teamId: a.task.team.teamId,
        teamName: a.task.team.teamName,
      },
    }));

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * GET /dashboard/me/notifications
   * Return latest notifications for logged-in member.
   */
  async getMyNotifications(
    userId: string,
    filterDto: MyNotificationsFilterDto,
  ): Promise<PaginatedNotificationsResponse> {
    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      select: { eventMemberId: true },
    });

    const eventMemberIds = eventMembers.map((em) => em.eventMemberId);

    if (eventMemberIds.length === 0) {
      return {
        data: [],
        total: 0,
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        totalPages: 0,
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      eventMemberId: { in: eventMemberIds },
    };

    if (filterDto.unreadOnly) {
      whereClause.isRead = false;
    }

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
