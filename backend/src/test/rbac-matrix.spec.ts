import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from '../events/event.service';
import { TeamService } from '../teams/team.service';
import { TaskService } from '../tasks/task.service';
import { TaskAssignmentService } from '../task-assignments/task-assignment.service';
import { NotificationService } from '../notifications/notification.service';
import { EventStatus, TaskStatus, TaskPriority, AssignmentStatus } from '@prisma/client';

describe('RBAC Authorization Matrix & Security Audit Test Suite', () => {
  let prismaMock: any;
  let eventService: EventService;
  let teamService: TeamService;
  let taskService: TaskService;
  let taskAssignmentService: TaskAssignmentService;
  let notificationService: NotificationService;

  const ORGANIZER_ID = 'user-organizer-uuid';
  const LEADER_A_ID = 'user-leader-a-uuid';
  const LEADER_B_ID = 'user-leader-b-uuid';
  const MEMBER_A_ID = 'user-member-a-uuid';
  const UNRELATED_USER_ID = 'user-unrelated-uuid';

  const EVENT_ID = 'event-1-uuid';
  const OTHER_EVENT_ID = 'event-2-uuid';
  const TEAM_A_ID = 'team-a-uuid';
  const TEAM_B_ID = 'team-b-uuid';
  const TASK_A_ID = 'task-a-uuid';
  const ASSIGNMENT_A_ID = 'assignment-a-uuid';

  const MOCK_EVENT = {
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    eventName: 'Tech Conference 2026',
    status: EventStatus.Active,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    members: [{ userId: ORGANIZER_ID }, { userId: LEADER_A_ID }, { userId: MEMBER_A_ID }],
    _count: { members: 3, teams: 2 },
  };

  const MOCK_TEAM_A = {
    teamId: TEAM_A_ID,
    eventId: EVENT_ID,
    teamName: 'Logistics Team',
    leaderMembershipId: 'mem-leader-a',
    event: MOCK_EVENT,
    leader: {
      teamMembershipId: 'mem-leader-a',
      eventMember: { userId: LEADER_A_ID, eventId: EVENT_ID },
    },
    _count: { members: 2, tasks: 1 },
  };

  const MOCK_TEAM_B = {
    teamId: TEAM_B_ID,
    eventId: EVENT_ID,
    teamName: 'Marketing Team',
    leaderMembershipId: 'mem-leader-b',
    event: MOCK_EVENT,
    leader: {
      teamMembershipId: 'mem-leader-b',
      eventMember: { userId: LEADER_B_ID, eventId: EVENT_ID },
    },
    _count: { members: 1, tasks: 0 },
  };

  const MOCK_TASK_A = {
    taskId: TASK_A_ID,
    teamId: TEAM_A_ID,
    taskTitle: 'Set up audio/video staging',
    status: TaskStatus.Pending,
    priority: TaskPriority.High,
    team: MOCK_TEAM_A,
    assignments: [
      {
        taskAssignmentId: ASSIGNMENT_A_ID,
        teamMembershipId: 'mem-member-a',
        assignmentStatus: AssignmentStatus.Assigned,
        teamMembership: {
          eventMember: { userId: MEMBER_A_ID, eventId: EVENT_ID },
        },
      },
    ],
  };

  beforeEach(() => {
    prismaMock = {
      event: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      eventMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      team: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      teamMembership: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
      },
      taskAssignment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      notification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    eventService = new EventService(prismaMock);
    teamService = new TeamService(prismaMock);
    taskService = new TaskService(prismaMock);
    taskAssignmentService = new TaskAssignmentService(prismaMock);
    notificationService = new NotificationService(prismaMock, null as any);
  });

  describe('1. Event Management RBAC', () => {
    it('Organizer can view event details', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      const res = await eventService.getEventDetails(EVENT_ID, ORGANIZER_ID);
      expect(res.eventId).toEqual(EVENT_ID);
    });

    it('Member can view event details', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      const res = await eventService.getEventDetails(EVENT_ID, MEMBER_A_ID);
      expect(res.eventId).toEqual(EVENT_ID);
    });

    it('Unrelated user is rejected from viewing event details (403 Forbidden)', async () => {
      prismaMock.event.findUnique.mockResolvedValue({
        ...MOCK_EVENT,
        members: [], // User not in event
      });
      await expect(eventService.getEventDetails(EVENT_ID, UNRELATED_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Organizer can update event details', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      prismaMock.event.update.mockResolvedValue({ ...MOCK_EVENT, eventName: 'Updated Name' });
      const res = await eventService.updateEvent(EVENT_ID, ORGANIZER_ID, { eventName: 'Updated Name' });
      expect(res.eventName).toEqual('Updated Name');
    });

    it('Team Leader cannot update event details (403 Forbidden)', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      await expect(
        eventService.updateEvent(EVENT_ID, LEADER_A_ID, { eventName: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Team Member cannot update event details (403 Forbidden)', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      await expect(
        eventService.updateEvent(EVENT_ID, MEMBER_A_ID, { eventName: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. Team Management RBAC', () => {
    it('Organizer can create a team', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      prismaMock.team.findUnique.mockResolvedValue(null);
      prismaMock.team.create.mockResolvedValue(MOCK_TEAM_A);

      const res = await teamService.createTeam(EVENT_ID, ORGANIZER_ID, { teamName: 'Logistics' });
      expect(res).toBeDefined();
    });

    it('Team Leader cannot create a team in event (403 Forbidden)', async () => {
      prismaMock.event.findUnique.mockResolvedValue(MOCK_EVENT);
      await expect(
        teamService.createTeam(EVENT_ID, LEADER_A_ID, { teamName: 'New Team' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Team Leader A can update their own Team A', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      prismaMock.team.update.mockResolvedValue({ ...MOCK_TEAM_A, description: 'Updated Desc' });

      const res = await teamService.updateTeam(TEAM_A_ID, LEADER_A_ID, { description: 'Updated Desc' });
      expect(res).toBeDefined();
    });

    it('Team Leader B cannot update Team A (Cross-Team Attack -> 403 Forbidden)', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      await expect(
        teamService.updateTeam(TEAM_A_ID, LEADER_B_ID, { description: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Team Member cannot delete a Team (403 Forbidden)', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      await expect(teamService.deleteTeam(TEAM_A_ID, MEMBER_A_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('3. Task Management & Completion RBAC', () => {
    it('Organizer can create a task for any team in their event', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-org',
        eventId: EVENT_ID,
        userId: ORGANIZER_ID,
      });
      prismaMock.task.findUnique.mockResolvedValue(null);
      prismaMock.task.create.mockResolvedValue(MOCK_TASK_A);

      const res = await taskService.createTask(TEAM_A_ID, ORGANIZER_ID, {
        taskTitle: 'New Task',
      });
      expect(res).toBeDefined();
    });

    it('Team Leader A can create a task for Team A', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-leader-a',
        eventId: EVENT_ID,
        userId: LEADER_A_ID,
        teamMembership: { teamMembershipId: 'mem-leader-a' },
      });
      prismaMock.task.findUnique.mockResolvedValue(null);
      prismaMock.task.create.mockResolvedValue(MOCK_TASK_A);

      const res = await taskService.createTask(TEAM_A_ID, LEADER_A_ID, {
        taskTitle: 'Team A Task',
      });
      expect(res).toBeDefined();
    });

    it('Team Leader B cannot create a task for Team A (Cross-Team -> 403 Forbidden)', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-leader-b',
        eventId: EVENT_ID,
        userId: LEADER_B_ID,
        teamMembership: { teamMembershipId: 'mem-leader-b' },
      });

      await expect(
        taskService.createTask(TEAM_A_ID, LEADER_B_ID, {
          taskTitle: 'Illegal Task',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Team Member cannot create tasks (403 Forbidden)', async () => {
      prismaMock.team.findUnique.mockResolvedValue(MOCK_TEAM_A);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-member-a',
        eventId: EVENT_ID,
        userId: MEMBER_A_ID,
        teamMembership: { teamMembershipId: 'mem-member-a' },
      });

      await expect(
        taskService.createTask(TEAM_A_ID, MEMBER_A_ID, {
          taskTitle: 'Member Task',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Team Leader A can decide overall Task.status (Completed)', async () => {
      prismaMock.task.findUnique.mockResolvedValue(MOCK_TASK_A);
      prismaMock.task.update.mockResolvedValue({ ...MOCK_TASK_A, status: TaskStatus.Completed });

      const res = await taskService.updateTaskStatus(TASK_A_ID, LEADER_A_ID, {
        status: TaskStatus.Completed,
      });
      expect(res.status).toEqual(TaskStatus.Completed);
    });

    it('Assigned Team Member A can update overall Task.status (InProgress)', async () => {
      prismaMock.task.findUnique.mockResolvedValue(MOCK_TASK_A);
      prismaMock.task.update.mockResolvedValue({ ...MOCK_TASK_A, status: TaskStatus.InProgress });

      const res = await taskService.updateTaskStatus(TASK_A_ID, MEMBER_A_ID, {
        status: TaskStatus.InProgress,
      });
      expect(res.status).toEqual(TaskStatus.InProgress);
    });

    it('Unassigned Member cannot modify overall Task.status (403 Forbidden)', async () => {
      prismaMock.task.findUnique.mockResolvedValue(MOCK_TASK_A);

      await expect(
        taskService.updateTaskStatus(TASK_A_ID, UNRELATED_USER_ID, {
          status: TaskStatus.Completed,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Task Assignment & Progress RBAC', () => {
    it('Assigned Member can update their own TaskAssignment progress', async () => {
      prismaMock.taskAssignment.findUnique.mockResolvedValue({
        taskAssignmentId: ASSIGNMENT_A_ID,
        assignmentStatus: AssignmentStatus.Assigned,
        task: MOCK_TASK_A,
        teamMembership: {
          eventMember: { userId: MEMBER_A_ID },
        },
      });
      prismaMock.taskAssignment.update.mockResolvedValue({
        taskAssignmentId: ASSIGNMENT_A_ID,
        assignmentStatus: AssignmentStatus.Completed,
      });

      const res = await taskAssignmentService.updateAssignmentStatus(
        ASSIGNMENT_A_ID,
        MEMBER_A_ID,
        { assignmentStatus: AssignmentStatus.Completed },
      );
      expect(res.assignmentStatus).toEqual(AssignmentStatus.Completed);
    });

    it('Another Team Member cannot modify another user assignment (IDOR -> 403 Forbidden)', async () => {
      prismaMock.taskAssignment.findUnique.mockResolvedValue({
        taskAssignmentId: ASSIGNMENT_A_ID,
        assignmentStatus: AssignmentStatus.Assigned,
        task: MOCK_TASK_A,
        teamMembership: {
          eventMember: { userId: MEMBER_A_ID }, // Belongs to Member A
        },
      });
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-other',
        userId: UNRELATED_USER_ID,
        teamMembership: { teamMembershipId: 'mem-other' },
      });

      await expect(
        taskAssignmentService.updateAssignmentStatus(
          ASSIGNMENT_A_ID,
          UNRELATED_USER_ID, // Malicious user attempting IDOR
          { assignmentStatus: AssignmentStatus.Completed },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Cross-team assignment is rejected (assigning Member from Team B to Task in Team A -> 400)', async () => {
      prismaMock.task.findUnique.mockResolvedValue(MOCK_TASK_A);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        eventMemberId: 'mem-leader-a',
        eventId: EVENT_ID,
        userId: LEADER_A_ID,
        teamMembership: { teamMembershipId: 'mem-leader-a' },
      });
      prismaMock.teamMembership.findUnique.mockResolvedValue({
        teamMembershipId: 'mem-member-b',
        teamId: TEAM_B_ID, // Different team!
        eventMember: { user: { userId: 'some-user' } },
      });

      await expect(
        taskAssignmentService.assignMemberToTask(TASK_A_ID, LEADER_A_ID, {
          teamMembershipId: 'mem-member-b',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('5. Notifications Isolation RBAC', () => {
    it('User can delete their own notification', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        notificationId: 'notif-1',
        eventMember: { userId: MEMBER_A_ID },
      });
      prismaMock.notification.delete.mockResolvedValue({ notificationId: 'notif-1' });

      await expect(
        notificationService.deleteNotification('notif-1', MEMBER_A_ID),
      ).resolves.not.toThrow();
    });

    it('User cannot delete another user notification (IDOR -> 403 Forbidden)', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        notificationId: 'notif-1',
        eventMember: { userId: MEMBER_A_ID }, // Belongs to Member A
      });

      await expect(
        notificationService.deleteNotification('notif-1', UNRELATED_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deleteExpiredNotifications strictly scopes to requesting user', async () => {
      await notificationService.deleteExpiredNotifications(MEMBER_A_ID);
      expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          eventMember: { userId: MEMBER_A_ID },
        },
      });
    });
  });
});
