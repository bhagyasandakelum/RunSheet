import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamService', () => {
  let service: TeamService;
  let prismaMock: any;

  const mockUser = {
    userId: 'user-uuid-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockEvent = {
    eventId: 'event-uuid-1',
    organizerId: 'user-uuid-1',
    eventName: 'Tech Conference 2026',
    status: EventStatus.Active,
  };

  const mockTeam = {
    teamId: 'team-uuid-1',
    eventId: 'event-uuid-1',
    teamName: 'Design Team',
    description: 'Design posters',
    leaderMembershipId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
    leader: null,
    _count: { members: 2, tasks: 5 },
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
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      teamMembership: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTeam', () => {
    it('should create a team successfully for organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockTeam);
      prismaMock.team.create.mockResolvedValue(mockTeam);

      const result = await service.createTeam('event-uuid-1', 'user-uuid-1', {
        teamName: 'Design Team',
        description: 'Design posters',
      });

      expect(result).toEqual(mockTeam);
      expect(prismaMock.team.create).toHaveBeenCalledWith({
        data: {
          eventId: 'event-uuid-1',
          teamName: 'Design Team',
          description: 'Design posters',
          leaderMembershipId: null,
        },
      });
    });

    it('should throw ForbiddenException if non-organizer attempts to create team', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.createTeam('event-uuid-1', 'other-user-uuid', {
          teamName: 'Design Team',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if event is completed', async () => {
      prismaMock.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.Completed,
      });

      await expect(
        service.createTeam('event-uuid-1', 'user-uuid-1', {
          teamName: 'Design Team',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if team name already exists in event', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);

      await expect(
        service.createTeam('event-uuid-1', 'user-uuid-1', {
          teamName: 'Design Team',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getTeamsByEvent', () => {
    it('should return list of teams for event member or organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findUnique.mockResolvedValue(null);
      prismaMock.team.findMany.mockResolvedValue([mockTeam]);

      const teams = await service.getTeamsByEvent('event-uuid-1', 'user-uuid-1');

      expect(teams).toHaveLength(1);
      expect(teams[0].teamName).toBe('Design Team');
      expect(teams[0].memberCount).toBe(2);
      expect(teams[0].taskCount).toBe(5);
    });

    it('should throw ForbiddenException if user is not organizer or member', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findUnique.mockResolvedValue(null);

      await expect(
        service.getTeamsByEvent('event-uuid-1', 'non-member-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTeamDetails', () => {
    it('should return team details when found', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.getTeamDetails('team-uuid-1', 'user-uuid-1');

      expect(result.teamId).toBe('team-uuid-1');
      expect(result.memberCount).toBe(2);
    });

    it('should throw NotFoundException if team does not exist', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null);

      await expect(
        service.getTeamDetails('invalid-id', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignTeamLeader', () => {
    it('should assign team leader successfully', async () => {
      prismaMock.team.findUnique.mockResolvedValueOnce(mockTeam);
      prismaMock.teamMembership.findUnique.mockResolvedValue({
        teamMembershipId: 'tm-uuid-1',
        teamId: 'team-uuid-1',
        eventMember: { eventId: 'event-uuid-1' },
      });
      prismaMock.team.findUnique.mockResolvedValueOnce(null); // leader check for other team
      prismaMock.team.update.mockResolvedValue({
        ...mockTeam,
        leaderMembershipId: 'tm-uuid-1',
      });

      const updated = await service.assignTeamLeader('team-uuid-1', 'user-uuid-1', {
        teamMembershipId: 'tm-uuid-1',
      });

      expect(updated.leaderMembershipId).toBe('tm-uuid-1');
    });

    it('should throw BadRequestException if team membership does not belong to team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.teamMembership.findUnique.mockResolvedValue({
        teamMembershipId: 'tm-uuid-1',
        teamId: 'other-team-uuid',
        eventMember: { eventId: 'event-uuid-1' },
      });

      await expect(
        service.assignTeamLeader('team-uuid-1', 'user-uuid-1', {
          teamMembershipId: 'tm-uuid-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTeam', () => {
    it('should delete team successfully', async () => {
      prismaMock.team.findUnique.mockResolvedValue(mockEvent);
      prismaMock.team.findUnique.mockResolvedValue(mockTeam);
      prismaMock.team.delete.mockResolvedValue(mockTeam);

      await expect(
        service.deleteTeam('team-uuid-1', 'user-uuid-1'),
      ).resolves.not.toThrow();
    });
  });
});
