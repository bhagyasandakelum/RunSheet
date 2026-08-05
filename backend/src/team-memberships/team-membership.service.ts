import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import {
  MyTeamMembershipResponse,
  TeamMemberListItem,
  TeamMembershipDetailsResponse,
  TeamStatisticsResponse,
  UnassignedMemberListItem,
} from './interfaces/team-membership-response.interface';

@Injectable()
export class TeamMembershipService {
  constructor(private readonly prisma: PrismaService) {}

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
        'You must be a member or organizer of this event to access team membership information',
      );
    }

    return { event, isOrganizer };
  }

  /**
   * 1. Add Member to Team
   * POST /teams/:teamId/members
   */
  async addMemberToTeam(teamId: string, userId: string, addMemberDto: AddMemberDto) {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: { event: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can assign members to teams');
    }

    if (
      team.event.status === EventStatus.Completed ||
      team.event.status === EventStatus.Archived ||
      team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify team memberships in a completed, archived, or cancelled event',
      );
    }

    const eventMember = await this.prisma.eventMember.findUnique({
      where: { eventMemberId: addMemberDto.eventMemberId },
    });

    if (!eventMember) {
      throw new NotFoundException('Event member not found');
    }

    if (eventMember.eventId !== team.eventId) {
      throw new BadRequestException('Selected member does not belong to this event');
    }

    const existingMembership = await this.prisma.teamMembership.findUnique({
      where: { eventMemberId: addMemberDto.eventMemberId },
    });

    if (existingMembership) {
      throw new ConflictException(
        'This member is already assigned to a team in this event. Transfer or remove them first.',
      );
    }

    return this.prisma.teamMembership.create({
      data: {
        teamId,
        eventMemberId: addMemberDto.eventMemberId,
        joinedAt: new Date(),
      },
      include: {
        team: true,
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
  }

  /**
   * 2. Get Team Members
   * GET /teams/:teamId/members
   */
  async getTeamMembers(teamId: string, userId: string): Promise<TeamMemberListItem[]> {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: { event: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.verifyEventAccess(team.eventId, userId);

    const memberships = await this.prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        eventMember: {
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
      },
    });

    const members: TeamMemberListItem[] = memberships.map((m) => {
      const isLeader = team.leaderMembershipId === m.teamMembershipId;
      return {
        teamMembershipId: m.teamMembershipId,
        eventMemberId: m.eventMemberId,
        firstName: m.eventMember.user.firstName,
        lastName: m.eventMember.user.lastName,
        email: m.eventMember.user.email,
        profilePhotoUrl: m.eventMember.user.profilePhotoUrl,
        joinedAt: m.joinedAt,
        isLeader,
      };
    });

    // Sort: Leader first, then alphabetical by name
    members.sort((a, b) => {
      if (a.isLeader && !b.isLeader) return -1;
      if (!a.isLeader && b.isLeader) return 1;

      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return members;
  }

  /**
   * 3. Get Team Membership Details
   * GET /team-memberships/:id
   */
  async getTeamMembershipDetails(
    membershipId: string,
    userId: string,
  ): Promise<TeamMembershipDetailsResponse> {
    const membership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId: membershipId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
        eventMember: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        assignedTasks: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    const isOrganizer = membership.team.event.organizerId === userId;
    const isOwner = membership.eventMember.userId === userId;

    if (!isOrganizer && !isOwner) {
      throw new ForbiddenException(
        'You do not have access to view this team membership details',
      );
    }

    const assignedTaskCount = membership.assignedTasks.length;
    const completedTaskCount = membership.assignedTasks.filter(
      (t) => t.assignmentStatus === 'Completed',
    ).length;

    return {
      teamMembershipId: membership.teamMembershipId,
      team: {
        teamId: membership.team.teamId,
        teamName: membership.team.teamName,
        description: membership.team.description,
        eventId: membership.team.eventId,
        leaderMembershipId: membership.team.leaderMembershipId,
        createdAt: membership.team.createdAt,
        updatedAt: membership.team.updatedAt,
      },
      event: {
        eventId: membership.team.event.eventId,
        eventName: membership.team.event.eventName,
        status: membership.team.event.status,
        organizerId: membership.team.event.organizerId,
        venue: membership.team.event.venue,
        startDate: membership.team.event.startDate,
        endDate: membership.team.event.endDate,
      },
      member: {
        eventMemberId: membership.eventMember.eventMemberId,
        userId: membership.eventMember.user.userId,
        firstName: membership.eventMember.user.firstName,
        lastName: membership.eventMember.user.lastName,
        email: membership.eventMember.user.email,
        phoneNumber: membership.eventMember.user.phoneNumber,
        profilePhotoUrl: membership.eventMember.user.profilePhotoUrl,
      },
      joinedAt: membership.joinedAt,
      assignedTaskCount,
      completedTaskCount,
    };
  }

  /**
   * 4. Transfer Member
   * PATCH /team-memberships/:id/transfer
   */
  async transferMember(
    membershipId: string,
    userId: string,
    transferDto: TransferMemberDto,
  ) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId: membershipId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    if (membership.team.event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can transfer team members');
    }

    if (
      membership.team.event.status === EventStatus.Completed ||
      membership.team.event.status === EventStatus.Archived ||
      membership.team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify team memberships in a completed, archived, or cancelled event',
      );
    }

    const destinationTeam = await this.prisma.team.findUnique({
      where: { teamId: transferDto.destinationTeamId },
    });

    if (!destinationTeam) {
      throw new NotFoundException('Destination team not found');
    }

    if (destinationTeam.eventId !== membership.team.eventId) {
      throw new BadRequestException('Destination team must belong to the same event');
    }

    if (membership.teamId === transferDto.destinationTeamId) {
      throw new BadRequestException('Member is already in the destination team');
    }

    return this.prisma.$transaction(async (tx) => {
      if (membership.team.leaderMembershipId === membershipId) {
        await tx.team.update({
          where: { teamId: membership.teamId },
          data: { leaderMembershipId: null },
        });
      }

      return tx.teamMembership.update({
        where: { teamMembershipId: membershipId },
        data: {
          teamId: transferDto.destinationTeamId,
        },
        include: {
          team: true,
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
    });
  }

  /**
   * 5. Remove Member from Team
   * DELETE /team-memberships/:id
   */
  async removeMember(membershipId: string, userId: string): Promise<void> {
    const membership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId: membershipId },
      include: {
        team: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    if (membership.team.event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can remove members from teams',
      );
    }

    if (
      membership.team.event.status === EventStatus.Completed ||
      membership.team.event.status === EventStatus.Archived ||
      membership.team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify team memberships in a completed, archived, or cancelled event',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (membership.team.leaderMembershipId === membershipId) {
        await tx.team.update({
          where: { teamId: membership.teamId },
          data: { leaderMembershipId: null },
        });
      }

      await tx.teamMembership.delete({
        where: { teamMembershipId: membershipId },
      });
    });
  }

  /**
   * 6. Get Members Without Team
   * GET /events/:eventId/unassigned-members
   */
  async getUnassignedMembers(
    eventId: string,
    userId: string,
  ): Promise<UnassignedMemberListItem[]> {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the event organizer can view members without a team',
      );
    }

    const unassignedMembers = await this.prisma.eventMember.findMany({
      where: {
        eventId,
        teamMembership: null,
      },
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return unassignedMembers.map((m) => ({
      eventMemberId: m.eventMemberId,
      userId: m.user.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      profilePhotoUrl: m.user.profilePhotoUrl,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * 7. Get My Team Membership
   * GET /team-memberships/me
   */
  async getMyTeamMembership(
    userId: string,
    eventId?: string,
  ): Promise<MyTeamMembershipResponse | null> {
    const whereClause: any = {
      eventMember: {
        userId,
      },
    };

    if (eventId) {
      whereClause.eventMember.eventId = eventId;
    }

    const membership = await this.prisma.teamMembership.findFirst({
      where: whereClause,
      include: {
        team: {
          include: {
            event: {
              select: {
                eventId: true,
                eventName: true,
                status: true,
                organizerId: true,
                venue: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    const isLeader = membership.team.leaderMembershipId === membership.teamMembershipId;

    return {
      teamMembershipId: membership.teamMembershipId,
      team: {
        teamId: membership.team.teamId,
        teamName: membership.team.teamName,
        description: membership.team.description,
        eventId: membership.team.eventId,
        leaderMembershipId: membership.team.leaderMembershipId,
        createdAt: membership.team.createdAt,
        updatedAt: membership.team.updatedAt,
      },
      event: {
        eventId: membership.team.event.eventId,
        eventName: membership.team.event.eventName,
        status: membership.team.event.status,
        organizerId: membership.team.event.organizerId,
        venue: membership.team.event.venue,
        startDate: membership.team.event.startDate,
        endDate: membership.team.event.endDate,
      },
      isLeader,
      joinedAt: membership.joinedAt,
    };
  }

  /**
   * 8. Get Team Statistics
   * GET /teams/:teamId/statistics
   */
  async getTeamStatistics(
    teamId: string,
    userId: string,
  ): Promise<TeamStatisticsResponse> {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: {
        event: true,
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
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.verifyEventAccess(team.eventId, userId);

    const leaderUser = team.leader?.eventMember?.user;
    const leaderName = leaderUser
      ? `${leaderUser.firstName} ${leaderUser.lastName}`
      : null;

    const tasks = await this.prisma.task.findMany({
      where: { teamId },
      select: { status: true },
    });

    const completedTasks = tasks.filter((t) => t.status === TaskStatus.Completed).length;
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.Pending).length;
    const activeTasks = tasks.filter(
      (t) =>
        t.status === TaskStatus.Pending ||
        t.status === TaskStatus.InProgress ||
        t.status === TaskStatus.OnHold,
    ).length;

    return {
      teamName: team.teamName,
      memberCount: team._count.members,
      leaderName,
      activeTasks,
      completedTasks,
      pendingTasks,
    };
  }
}
