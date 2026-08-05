import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AssignmentStatus,
  EventStatus,
  NotificationType,
  TaskPriority,
  TaskStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaMock: any;

  const mockOrganizerUser = {
    userId: 'org-user-1',
    firstName: 'Alice',
    lastName: 'Organizer',
    email: 'alice@example.com',
  };

  const mockMemberUser = {
    userId: 'member-user-1',
    firstName: 'Bob',
    lastName: 'Member',
    email: 'bob@example.com',
  };

  const mockEvent = {
    eventId: 'event-1',
    organizerId: 'org-user-1',
    eventName: 'Tech Summit 2026',
    description: 'Annual summit',
    venue: 'Main Auditorium',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: EventStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEventMember = {
    eventMemberId: 'em-1',
    eventId: 'event-1',
    userId: 'member-user-1',
    user: mockMemberUser,
    event: mockEvent,
    teamMembership: {
      teamMembershipId: 'tm-1',
      teamId: 'team-1',
      team: { teamId: 'team-1', teamName: 'Frontend' },
      leadingTeam: null,
    },
    joinedAt: new Date(),
    createdAt: new Date(),
  };

  const mockTeam = {
    teamId: 'team-1',
    eventId: 'event-1',
    teamName: 'Frontend',
    leader: null,
    createdAt: new Date(),
    _count: { members: 3, tasks: 5 },
    tasks: [
      { status: TaskStatus.Completed },
      { status: TaskStatus.Completed },
      { status: TaskStatus.Pending },
      { status: TaskStatus.InProgress },
      { status: TaskStatus.Pending },
    ],
  };

  const mockTask = {
    taskId: 'task-1',
    teamId: 'team-1',
    taskTitle: 'Design Landing Page',
    priority: TaskPriority.High,
    status: TaskStatus.Pending,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    team: { teamName: 'Frontend' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      event: {
        findUnique: jest.fn(),
      },
      eventMember: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      team: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      task: {
        findMany: jest.fn(),
      },
      taskAssignment: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      notification: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyOrganizerAccess', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      prismaMock.event.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyOrganizerAccess('invalid-id', 'org-user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if requester is not the organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.verifyOrganizerAccess('event-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return event if user is organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.verifyOrganizerAccess('event-1', 'org-user-1');
      expect(result.eventId).toBe('event-1');
    });
  });

  describe('getOrganizerDashboard', () => {
    it('should return comprehensive organizer dashboard response', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.count.mockResolvedValue(1);
      prismaMock.eventMember.count.mockResolvedValue(4);
      prismaMock.task.findMany
        .mockResolvedValueOnce([mockTask]) // all tasks
        .mockResolvedValueOnce([mockTask]) // upcoming deadlines
        .mockResolvedValueOnce([mockTask]) // critical tasks
        .mockResolvedValueOnce([mockTask]); // recent tasks

      prismaMock.taskAssignment.count.mockResolvedValue(3);
      prismaMock.team.findMany.mockResolvedValue([mockTeam]);
      prismaMock.notification.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // unread
        .mockResolvedValueOnce(7); // read

      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.taskAssignment.findMany.mockResolvedValue([]);

      const res = await service.getOrganizerDashboard('event-1', 'org-user-1');

      expect(res.eventSummary.eventName).toBe('Tech Summit 2026');
      expect(res.eventSummary.totalTeams).toBe(1);
      expect(res.eventSummary.totalMembers).toBe(4);
      expect(res.taskSummary.pendingTasks).toBe(1);
      expect(res.teamSummary).toHaveLength(1);
      expect(res.notificationSummary.unreadNotifications).toBe(3);
      expect(res.recentActivities.length).toBeGreaterThan(0);
    });
  });

  describe('getMemberDashboard', () => {
    it('should return member dashboard response', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockMemberUser);
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.taskAssignment.findMany.mockResolvedValue([
        {
          taskAssignmentId: 'ta-1',
          taskId: 'task-1',
          assignmentStatus: AssignmentStatus.Assigned,
          task: {
            taskId: 'task-1',
            taskTitle: 'Fix Bug',
            priority: TaskPriority.High,
            dueDate: new Date(),
            team: { teamName: 'Frontend' },
          },
        },
      ]);
      prismaMock.notification.findMany.mockResolvedValue([
        {
          notificationId: 'notif-1',
          title: 'Welcome',
          message: 'Hello Bob',
          notificationType: NotificationType.GeneralAnnouncement,
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const res = await service.getMemberDashboard('member-user-1');

      expect(res.profile.firstName).toBe('Bob');
      expect(res.profile.team).toBe('Frontend');
      expect(res.taskSummary.assigned).toBe(1);
      expect(res.upcomingDeadlines).toHaveLength(1);
      expect(res.highPriorityTasks).toHaveLength(1);
      expect(res.notifications).toHaveLength(1);
    });

    it('should throw NotFoundException if user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getMemberDashboard('missing-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEventStatistics', () => {
    it('should calculate statistics correctly', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.count.mockResolvedValue(2);
      prismaMock.eventMember.count.mockResolvedValue(10);
      prismaMock.task.findMany.mockResolvedValue([
        { status: TaskStatus.Completed, dueDate: null },
        { status: TaskStatus.Pending, dueDate: null },
        { status: TaskStatus.Overdue, dueDate: null },
      ]);

      const stats = await service.getEventStatistics('event-1', 'org-user-1');

      expect(stats.events).toBe(1);
      expect(stats.teams).toBe(2);
      expect(stats.members).toBe(10);
      expect(stats.tasks).toBe(3);
      expect(stats.completedTasks).toBe(1);
      expect(stats.pendingTasks).toBe(1);
      expect(stats.overdueTasks).toBe(1);
      expect(stats.completionPercentage).toBe(33.3);
    });
  });

  describe('getTeamAnalytics', () => {
    it('should return analytics for all teams', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.findMany.mockResolvedValue([mockTeam]);

      const analytics = await service.getTeamAnalytics('event-1', 'org-user-1');

      expect(analytics).toHaveLength(1);
      expect(analytics[0].teamName).toBe('Frontend');
      expect(analytics[0].taskCount).toBe(5);
      expect(analytics[0].completedCount).toBe(2);
      expect(analytics[0].pendingCount).toBe(2);
      expect(analytics[0].progressPercentage).toBe(40);
    });
  });

  describe('getTaskAnalytics', () => {
    it('should return grouped counts by status', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.task.findMany.mockResolvedValue([
        { status: TaskStatus.Pending, dueDate: null },
        { status: TaskStatus.InProgress, dueDate: null },
        { status: TaskStatus.Completed, dueDate: null },
      ]);

      const res = await service.getTaskAnalytics('event-1', 'org-user-1');

      expect(res.pending).toBe(1);
      expect(res.inProgress).toBe(1);
      expect(res.completed).toBe(1);
      expect(res.onHold).toBe(0);
      expect(res.cancelled).toBe(0);
      expect(res.overdue).toBe(0);
    });
  });

  describe('getTimeline', () => {
    it('should return newest activity feed up to 50 items', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.findMany.mockResolvedValue([
        { teamId: 't-1', teamName: 'Design', createdAt: new Date() },
      ]);
      prismaMock.eventMember.findMany.mockResolvedValue([]);
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.taskAssignment.findMany.mockResolvedValue([]);

      const timeline = await service.getTimeline('event-1', 'org-user-1');

      expect(timeline.length).toBeGreaterThan(0);
      expect(timeline[0].type).toBeDefined();
    });
  });

  describe('getMyTasks', () => {
    it('should return paginated task assignments for user', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.taskAssignment.count.mockResolvedValue(1);
      prismaMock.taskAssignment.findMany.mockResolvedValue([
        {
          taskAssignmentId: 'ta-1',
          taskId: 'task-1',
          assignmentStatus: AssignmentStatus.Assigned,
          assignedAt: new Date(),
          completedAt: null,
          task: {
            taskTitle: 'Build Form',
            description: 'Form details',
            priority: TaskPriority.Medium,
            status: TaskStatus.Pending,
            dueDate: new Date(),
            team: { teamId: 'team-1', teamName: 'Frontend' },
          },
        },
      ]);

      const result = await service.getMyTasks('member-user-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return empty pagination response if user is not in any team', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([]);

      const result = await service.getMyTasks('user-without-team', {});

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getMyNotifications', () => {
    it('should return paginated notifications for user', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.notification.count.mockResolvedValue(1);
      prismaMock.notification.findMany.mockResolvedValue([
        {
          notificationId: 'n-1',
          title: 'Hello',
          message: 'Test message',
          isRead: false,
        },
      ]);

      const result = await service.getMyNotifications('member-user-1', { unreadOnly: true });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
