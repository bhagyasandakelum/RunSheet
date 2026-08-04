import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentStatus, EventStatus } from '@prisma/client';
import { TaskAssignmentService } from './task-assignment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TaskAssignmentService', () => {
  let service: TaskAssignmentService;
  let prismaMock: any;

  const mockUser = {
    userId: 'user-uuid-1',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david@example.com',
    profilePhotoUrl: null,
  };

  const mockEvent = {
    eventId: 'event-uuid-1',
    organizerId: 'user-uuid-1',
    eventName: 'Expo 2026',
    status: EventStatus.Active,
  };

  const mockTeam = {
    teamId: 'team-uuid-1',
    eventId: 'event-uuid-1',
    teamName: 'Logistics',
    leaderMembershipId: 'tm-uuid-1',
    event: mockEvent,
  };

  const mockTask = {
    taskId: 'task-uuid-1',
    teamId: 'team-uuid-1',
    taskTitle: 'Setup Booths',
    team: mockTeam,
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

  const mockTeamMembership = {
    teamMembershipId: 'tm-uuid-1',
    teamId: 'team-uuid-1',
    eventMemberId: 'em-uuid-1',
    eventMember: mockEventMember,
  };

  const mockAssignment = {
    taskAssignmentId: 'ta-uuid-1',
    taskId: 'task-uuid-1',
    teamMembershipId: 'tm-uuid-1',
    assignedByMemberId: 'em-uuid-1',
    assignmentStatus: AssignmentStatus.Assigned,
    assignedAt: new Date(),
    completedAt: null,
    task: mockTask,
    teamMembership: mockTeamMembership,
    assignedBy: mockEventMember,
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
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
      },
      taskAssignment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskAssignmentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TaskAssignmentService>(TaskAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignMemberToTask', () => {
    it('should assign member to task successfully', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);
      prismaMock.taskAssignment.findUnique.mockResolvedValue(null);
      prismaMock.taskAssignment.count.mockResolvedValue(1); // 1 existing < 3
      prismaMock.taskAssignment.create.mockResolvedValue(mockAssignment);

      const result = await service.assignMemberToTask('task-uuid-1', 'user-uuid-1', {
        teamMembershipId: 'tm-uuid-1',
      });

      expect(result).toEqual(mockAssignment);
      expect(prismaMock.taskAssignment.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if task already has 3 assignees', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);
      prismaMock.taskAssignment.findUnique.mockResolvedValue(null);
      prismaMock.taskAssignment.count.mockResolvedValue(3);

      await expect(
        service.assignMemberToTask('task-uuid-1', 'user-uuid-1', {
          teamMembershipId: 'tm-uuid-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if member belongs to another team', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue({
        ...mockTeamMembership,
        teamId: 'other-team-id',
      });

      await expect(
        service.assignMemberToTask('task-uuid-1', 'user-uuid-1', {
          teamMembershipId: 'tm-uuid-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if member is already assigned', async () => {
      prismaMock.task.findUnique.mockResolvedValue(mockTask);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);
      prismaMock.taskAssignment.findUnique.mockResolvedValue(mockAssignment);

      await expect(
        service.assignMemberToTask('task-uuid-1', 'user-uuid-1', {
          teamMembershipId: 'tm-uuid-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should set completedAt when status is updated to Completed', async () => {
      prismaMock.taskAssignment.findUnique.mockResolvedValue(mockAssignment);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.taskAssignment.update.mockImplementation(({ data }) => ({
        ...mockAssignment,
        assignmentStatus: data.assignmentStatus,
        completedAt: data.completedAt,
      }));

      const updated = await service.updateAssignmentStatus('ta-uuid-1', 'user-uuid-1', {
        assignmentStatus: AssignmentStatus.Completed,
      });

      expect(updated.assignmentStatus).toBe(AssignmentStatus.Completed);
      expect(updated.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeAssignment', () => {
    it('should remove task assignment record without deleting task', async () => {
      prismaMock.taskAssignment.findUnique.mockResolvedValue(mockAssignment);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.taskAssignment.delete.mockResolvedValue(mockAssignment);

      await expect(
        service.removeAssignment('ta-uuid-1', 'user-uuid-1'),
      ).resolves.not.toThrow();

      expect(prismaMock.taskAssignment.delete).toHaveBeenCalledWith({
        where: { taskAssignmentId: 'ta-uuid-1' },
      });
    });
  });

  describe('getAssignmentStatistics', () => {
    it('should return assignment statistics for organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.teamMembership.findMany.mockResolvedValue([
        { teamMembershipId: 'tm-uuid-1' },
        { teamMembershipId: 'tm-uuid-2' },
      ]);
      prismaMock.taskAssignment.findMany.mockResolvedValue([
        { taskAssignmentId: 'ta-1', teamMembershipId: 'tm-uuid-1', assignmentStatus: AssignmentStatus.Completed },
        { taskAssignmentId: 'ta-2', teamMembershipId: 'tm-uuid-1', assignmentStatus: AssignmentStatus.InProgress },
        { taskAssignmentId: 'ta-3', teamMembershipId: 'tm-uuid-1', assignmentStatus: AssignmentStatus.Assigned },
      ]);

      const stats = await service.getAssignmentStatistics('event-uuid-1', 'user-uuid-1');

      expect(stats.totalAssignments).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.assigned).toBe(1);
      expect(stats.membersWithNoAssignments).toBe(1);
      expect(stats.overloadedMembers).toBe(1);
    });
  });
});
