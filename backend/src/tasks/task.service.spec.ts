import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TaskService', () => {
  let service: TaskService;
  let prismaMock: any;

  const mockUser = {
    userId: 'user-uuid-1',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
  };

  const mockEvent = {
    eventId: 'event-uuid-1',
    organizerId: 'user-uuid-1',
    eventName: 'Design Summit 2026',
    status: EventStatus.Active,
  };

  const mockTeam = {
    teamId: 'team-uuid-1',
    eventId: 'event-uuid-1',
    teamName: 'Branding Team',
    description: 'Logo & Colors',
    leaderMembershipId: 'tm-uuid-1',
    event: mockEvent,
  };

  const mockEventMember = {
    eventMemberId: 'em-uuid-1',
    eventId: 'event-uuid-1',
    userId: 'user-uuid-1',
    user: mockUser,
    teamMembership: {
      teamMembershipId: 'tm-uuid-1',
    },
  };

  const mockTask = {
    taskId: 'task-uuid-1',
    teamId: 'team-uuid-1',
    createdByMemberId: 'em-uuid-1',
    taskTitle: 'Create Logo Concepts',
    description: 'Draft 3 options',
    priority: TaskPriority.High,
    status: TaskStatus.Pending,
    dueDate: new Date('2026-09-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    team: mockTeam,
    createdBy: mockEventMember,
    _count: { assignments: 2 },
  };

  beforeEach(async () => {
    prismaMock = {
      event: {
        findUnique: jest.fn(),
      },
      eventMember: {
        findUnique: jest.fn(),
      },
      team: {
        findUnique: jest.fn(),
      },
      teamMembership: {
        findMany: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      taskAssignment: {
        count: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task successfully for organizer', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.task.create.mockResolvedValue(mockTask);

      const result = await service.createTask('team-uuid-1', 'user-uuid-1', {
        taskTitle: 'Create Logo Concepts',
        priority: TaskPriority.High,
      });

      expect(result).toEqual(mockTask);
      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: {
          teamId: 'team-uuid-1',
          createdByMemberId: 'em-uuid-1',
          taskTitle: 'Create Logo Concepts',
          description: null,
          priority: TaskPriority.High,
          status: TaskStatus.Pending,
          dueDate: null,
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
    });

    it('should throw BadRequestException if event is Completed', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        ...mockTeam,
        event: { ...mockEvent, status: EventStatus.Completed },
      });

      await expect(
        service.createTask('team-uuid-1', 'user-uuid-1', {
          taskTitle: 'Create Logo Concepts',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for regular member', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue({
        ...mockEventMember,
        userId: 'other-user-uuid',
        teamMembership: { teamMembershipId: 'tm-uuid-2' }, // not leader
      });

      await expect(
        service.createTask('team-uuid-1', 'other-user-uuid', {
          taskTitle: 'Create Logo Concepts',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTeamTasks', () => {
    it('should return tasks for team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.task.findMany.mockResolvedValue([mockTask]);

      const tasks = await service.getTeamTasks('team-uuid-1', 'user-uuid-1', {});

      expect(tasks).toHaveLength(1);
      expect(tasks[0].taskTitle).toBe('Create Logo Concepts');
    });
  });

  describe('getTaskDetails', () => {
    it('should return task details with assignment counts', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.taskAssignment.count.mockResolvedValue(1);

      const details = await service.getTaskDetails('task-uuid-1', 'user-uuid-1');

      expect(details.taskId).toBe('task-uuid-1');
      expect(details.assignmentCount).toBe(2);
      expect(details.completedAssignmentCount).toBe(1);
    });

    it('should throw NotFoundException if task not found', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      await expect(
        service.getTaskDetails('invalid-task', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    it('should update task successfully for organizer', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.task.update.mockResolvedValue({ ...mockTask, taskTitle: 'New Title' });

      const updated = await service.updateTask('task-uuid-1', 'user-uuid-1', {
        taskTitle: 'New Title',
      });

      expect(updated.taskTitle).toBe('New Title');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.task.update.mockResolvedValue({ ...mockTask, status: TaskStatus.Completed });

      const updated = await service.updateTaskStatus('task-uuid-1', 'user-uuid-1', {
        status: TaskStatus.Completed,
      });

      expect(updated.status).toBe(TaskStatus.Completed);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.task.delete.mockResolvedValue(mockTask);

      await expect(
        service.deleteTask('task-uuid-1', 'user-uuid-1'),
      ).resolves.not.toThrow();

      expect(prismaMock.task.delete).toHaveBeenCalledWith({
        where: { taskId: 'task-uuid-1' },
      });
    });
  });

  describe('getTaskStatistics', () => {
    it('should calculate task statistics for organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.task.findMany.mockResolvedValue([
        { status: TaskStatus.Pending, priority: TaskPriority.Medium },
        { status: TaskStatus.Completed, priority: TaskPriority.High },
        { status: TaskStatus.InProgress, priority: TaskPriority.Critical },
      ]);

      const stats = await service.getTaskStatistics('event-uuid-1', 'user-uuid-1');

      expect(stats.totalTasks).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.highPriorityCount).toBe(1);
      expect(stats.criticalPriorityCount).toBe(1);
    });

    it('should throw ForbiddenException if non-organizer requests task statistics', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.getTaskStatistics('event-uuid-1', 'non-organizer-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
