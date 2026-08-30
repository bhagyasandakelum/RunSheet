import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, TaskStatus } from '@prisma/client';
import { TeamMembershipService } from './team-membership.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamMembershipService', () => {
  let service: TeamMembershipService;
  let prismaMock: any;

  const mockUser = {
    userId: 'user-uuid-1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    profilePhotoUrl: null,
  };

  const mockEvent = {
    eventId: 'event-uuid-1',
    organizerId: 'user-uuid-1',
    eventName: 'Hackathon 2026',
    status: EventStatus.Active,
  };

  const mockTeam = {
    teamId: 'team-uuid-1',
    eventId: 'event-uuid-1',
    teamName: 'Frontend Devs',
    description: 'UI/UX team',
    leaderMembershipId: 'tm-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
    leader: null,
    _count: { members: 2, tasks: 4 },
  };

  const mockEventMember = {
    eventMemberId: 'em-uuid-1',
    eventId: 'event-uuid-1',
    userId: 'user-uuid-1',
    user: mockUser,
  };

  const mockTeamMembership = {
    teamMembershipId: 'tm-uuid-1',
    teamId: 'team-uuid-1',
    eventMemberId: 'em-uuid-1',
    joinedAt: new Date(),
    team: mockTeam,
    eventMember: mockEventMember,
    assignedTasks: [
      { taskAssignmentId: 'ta-1', assignmentStatus: 'Completed' },
      { taskAssignmentId: 'ta-2', assignmentStatus: 'Assigned' },
    ],
  };

  beforeEach(async () => {
    prismaMock = {
      event: {
        findUnique: jest.fn(),
      },
      eventMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      team: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      teamMembership: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        findMany: jest.fn(),
      },
      taskAssignment: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembershipService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TeamMembershipService>(TeamMembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMemberToTeam', () => {
    it('should add member to team successfully', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue(null); // not already in team
      prismaMock.teamMembership.create.mockResolvedValue(mockTeamMembership);

      const result = await service.addMemberToTeam('team-uuid-1', 'user-uuid-1', {
        eventMemberId: 'em-uuid-1',
      });

      expect(result).toEqual(mockTeamMembership);
      expect(prismaMock.teamMembership.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-organizer tries to add member', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);

      await expect(
        service.addMemberToTeam('team-uuid-1', 'other-user', {
          eventMemberId: 'em-uuid-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if event is completed', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        ...mockTeam,
        event: { ...mockEvent, status: EventStatus.Completed },
      });

      await expect(
        service.addMemberToTeam('team-uuid-1', 'user-uuid-1', {
          eventMemberId: 'em-uuid-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if member is already assigned to a team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);

      await expect(
        service.addMemberToTeam('team-uuid-1', 'user-uuid-1', {
          eventMemberId: 'em-uuid-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getTeamMembers', () => {
    it('should return sorted team members', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findUnique.mockResolvedValue(mockEventMember);
      prismaMock.teamMembership.findMany.mockResolvedValue([
        {
          teamMembershipId: 'tm-uuid-2',
          eventMemberId: 'em-uuid-2',
          joinedAt: new Date(),
          eventMember: { user: { firstName: 'Bob', lastName: 'Zucker', email: 'bob@ex.com', profilePhotoUrl: null } },
        },
        {
          teamMembershipId: 'tm-uuid-1', // leader
          eventMemberId: 'em-uuid-1',
          joinedAt: new Date(),
          eventMember: { user: { firstName: 'Alice', lastName: 'Adam', email: 'alice@ex.com', profilePhotoUrl: null } },
        },
      ]);

      const members = await service.getTeamMembers('team-uuid-1', 'user-uuid-1');

      expect(members).toHaveLength(2);
      expect(members[0].isLeader).toBe(true);
      expect(members[0].firstName).toBe('Alice');
    });
  });

  describe('getTeamMembershipDetails', () => {
    it('should return details with task counts for owner or organizer', async () => {
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);

      const details = await service.getTeamMembershipDetails('tm-uuid-1', 'user-uuid-1');

      expect(details.assignedTaskCount).toBe(2);
      expect(details.completedTaskCount).toBe(1);
    });

    it('should throw ForbiddenException if user is neither organizer nor member owner', async () => {
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);

      await expect(
        service.getTeamMembershipDetails('tm-uuid-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('transferMember', () => {
    it('should transfer member and clear leader status if transferring leader', async () => {
      const destTeam = {
        teamId: 'team-uuid-2',
        eventId: 'event-uuid-1',
        teamName: 'Backend Devs',
      };

      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);
      prismaMock.team.findUnique.mockResolvedValue(destTeam);
      prismaMock.team.update.mockResolvedValue({});
      prismaMock.teamMembership.update.mockResolvedValue({
        ...mockTeamMembership,
        teamId: 'team-uuid-2',
      });

      const result = await service.transferMember('tm-uuid-1', 'user-uuid-1', {
        destinationTeamId: 'team-uuid-2',
      });

      expect(result.teamId).toBe('team-uuid-2');
      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { teamId: 'team-uuid-1' },
        data: { leaderMembershipId: null },
      });
    });
  });

  describe('removeMember', () => {
    it('should remove member and clear leader status if removing leader', async () => {
      prismaMock.teamMembership.findUnique.mockResolvedValue(mockTeamMembership);
      prismaMock.team.update.mockResolvedValue({});
      prismaMock.teamMembership.delete.mockResolvedValue({});

      await expect(
        service.removeMember('tm-uuid-1', 'user-uuid-1'),
      ).resolves.not.toThrow();

      expect(prismaMock.team.update).toHaveBeenCalledWith({
        where: { teamId: 'team-uuid-1' },
        data: { leaderMembershipId: null },
      });
      expect(prismaMock.teamMembership.delete).toHaveBeenCalledWith({
        where: { teamMembershipId: 'tm-uuid-1' },
      });
    });
  });

  describe('getUnassignedMembers', () => {
    it('should return list of unassigned members for organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);

      const unassigned = await service.getUnassignedMembers('event-uuid-1', 'user-uuid-1');

      expect(unassigned).toHaveLength(1);
      expect(unassigned[0].eventMemberId).toBe('em-uuid-1');
    });
  });

  describe('getTeamStatistics', () => {
    it('should return team statistics correctly', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        ...mockTeam,
        leader: {
          eventMember: {
            user: { firstName: 'Alice', lastName: 'Smith' },
          },
        },
      });
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.task.findMany.mockResolvedValue([
        { status: TaskStatus.Completed },
        { status: TaskStatus.Pending },
        { status: TaskStatus.InProgress },
      ]);

      const stats = await service.getTeamStatistics('team-uuid-1', 'user-uuid-1');

      expect(stats.teamName).toBe('Frontend Devs');
      expect(stats.leaderName).toBe('Alice Smith');
      expect(stats.completedTasks).toBe(1);
      expect(stats.pendingTasks).toBe(1);
      expect(stats.activeTasks).toBe(2);
    });
  });
});
