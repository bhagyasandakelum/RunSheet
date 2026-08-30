import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AssignTeamLeaderDto } from './dto/assign-team-leader.dto';
import {
  TeamDetailsResponse,
  TeamListItem,
} from './interfaces/team-response.interface';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Helper: Verify user is organizer or event member for read access.
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
      include: {
        teamMembership: true,
      },
    });

    if (!isOrganizer && !isMember) {
      throw new ForbiddenException(
        'You must be a member or organizer of this event to access team information',
      );
    }

    return { event, isOrganizer, eventMember: isMember };
  }

  /**
   * Helper: Verify user is organizer and event status allows modifications.
   */
  private async verifyOrganizerModificationAccess(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can perform this action');
    }

    if (
      event.status === EventStatus.Completed ||
      event.status === EventStatus.Archived ||
      event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify teams in a completed, archived, or cancelled event',
      );
    }

    return event;
  }

  /**
   * Helper: Verify team exists, user is organizer or team leader, and event is not locked.
   */
  private async verifyTeamModificationAccess(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: {
        event: true,
        leader: {
          include: {
            eventMember: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isOrganizer = team.event.organizerId === userId;
    const isLeader = team.leader?.eventMember?.userId === userId;

    if (!isOrganizer) {
      throw new ForbiddenException('Only the event organizer can edit this team');
    }

    if (
      team.event.status === EventStatus.Completed ||
      team.event.status === EventStatus.Archived ||
      team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify teams in a completed, archived, or cancelled event',
      );
    }

    return { team, isOrganizer, isLeader };
  }

  /**
   * Helper: Verify team exists, user is organizer, and event is not locked.
   */
  private async verifyTeamAndOrganizerAccess(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
      include: { event: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can perform this action');
    }

    if (
      team.event.status === EventStatus.Completed ||
      team.event.status === EventStatus.Archived ||
      team.event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify teams in a completed, archived, or cancelled event',
      );
    }

    return team;
  }

  /**
   * 1. Create Team
   * POST /events/:eventId/teams
   */
  async createTeam(eventId: string, userId: string, createTeamDto: CreateTeamDto) {
    await this.verifyOrganizerModificationAccess(eventId, userId);

    const existingTeam = await this.prisma.team.findUnique({
      where: {
        eventId_teamName: {
          eventId,
          teamName: createTeamDto.teamName,
        },
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        `A team named '${createTeamDto.teamName}' already exists in this event`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          eventId,
          teamName: createTeamDto.teamName,
          description: createTeamDto.description || null,
          leaderMembershipId: null,
        },
      });

      let leaderEventMemberId = createTeamDto.leaderEventMemberId;

      if (!leaderEventMemberId && createTeamDto.leaderUserId) {
        let member = await tx.eventMember.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId: createTeamDto.leaderUserId,
            },
          },
        });

        if (!member) {
          member = await tx.eventMember.create({
            data: {
              eventId,
              userId: createTeamDto.leaderUserId,
            },
          });
        }

        leaderEventMemberId = member.eventMemberId;
      }

      if (leaderEventMemberId) {
        const existingMembership = await tx.teamMembership.findUnique({
          where: { eventMemberId: leaderEventMemberId },
        });

        let membership = existingMembership;
        if (!membership) {
          membership = await tx.teamMembership.create({
            data: {
              teamId: team.teamId,
              eventMemberId: leaderEventMemberId,
            },
          });
        }

        await tx.team.update({
          where: { teamId: team.teamId },
          data: { leaderMembershipId: membership.teamMembershipId },
        });
      }

      return tx.team.findUnique({
        where: { teamId: team.teamId },
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
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      });
    });
  }

  /**
   * 2. Get All Teams in Event
   * GET /events/:eventId/teams
   */
  async getTeamsByEvent(eventId: string, userId: string): Promise<TeamListItem[]> {
    await this.verifyEventReadAccess(eventId, userId);

    const teams = await this.prisma.team.findMany({
      where: { eventId },
      orderBy: { teamName: 'asc' },
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
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    return teams.map((team) => {
      const leaderUser = team.leader?.eventMember?.user;
      const leaderName = leaderUser
        ? `${leaderUser.firstName} ${leaderUser.lastName}`
        : null;

      const leaderInfo = team.leader && leaderUser
        ? {
          teamMembershipId: team.leader.teamMembershipId,
          eventMemberId: team.leader.eventMemberId,
          user: leaderUser,
        }
        : null;

      return {
        teamId: team.teamId,
        eventId: team.eventId,
        teamName: team.teamName,
        description: team.description,
        leaderMembershipId: team.leaderMembershipId,
        leaderName,
        leader: leaderInfo,
        memberCount: team._count.members,
        taskCount: team._count.tasks,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      };
    });
  }

  /**
   * 3. Get Team Details
   * GET /teams/:teamId
   */
  async getTeamDetails(teamId: string, userId: string): Promise<TeamDetailsResponse> {
    const team = await this.prisma.team.findUnique({
      where: { teamId },
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

    // Authorization check
    await this.verifyEventReadAccess(team.eventId, userId);

    const leaderUser = team.leader?.eventMember?.user;
    const leaderName = leaderUser
      ? `${leaderUser.firstName} ${leaderUser.lastName}`
      : null;

    const leaderInfo = team.leader && leaderUser
      ? {
        teamMembershipId: team.leader.teamMembershipId,
        eventMemberId: team.leader.eventMemberId,
        user: leaderUser,
      }
      : null;

    return {
      teamId: team.teamId,
      eventId: team.eventId,
      teamName: team.teamName,
      description: team.description,
      leaderMembershipId: team.leaderMembershipId,
      leaderName,
      leader: leaderInfo,
      event: team.event,
      memberCount: team._count.members,
      taskCount: team._count.tasks,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }

  /**
   * 4. Update Team
   * PATCH /teams/:teamId
   */
  async updateTeam(teamId: string, userId: string, updateTeamDto: UpdateTeamDto) {
    const { team } = await this.verifyTeamModificationAccess(teamId, userId);

    if (updateTeamDto.teamName && updateTeamDto.teamName !== team.teamName) {
      const existingTeam = await this.prisma.team.findUnique({
        where: {
          eventId_teamName: {
            eventId: team.eventId,
            teamName: updateTeamDto.teamName,
          },
        },
      });

      if (existingTeam && existingTeam.teamId !== teamId) {
        throw new ConflictException(
          `A team named '${updateTeamDto.teamName}' already exists in this event`,
        );
      }
    }

    return this.prisma.team.update({
      where: { teamId },
      data: {
        ...(updateTeamDto.teamName !== undefined && { teamName: updateTeamDto.teamName }),
        ...(updateTeamDto.description !== undefined && { description: updateTeamDto.description }),
      },
    });
  }

  /**
   * 5. Delete Team
   * DELETE /teams/:teamId
   */
  async deleteTeam(teamId: string, userId: string): Promise<void> {
    await this.verifyTeamAndOrganizerAccess(teamId, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.team.delete({
        where: { teamId },
      });
    });
  }

  /**
   * 6. Assign Team Leader
   * PATCH /teams/:teamId/leader
   */
  async assignTeamLeader(
    teamId: string,
    userId: string,
    assignTeamLeaderDto: AssignTeamLeaderDto,
  ) {
    const team = await this.verifyTeamAndOrganizerAccess(teamId, userId);

    const teamMembership = await this.prisma.teamMembership.findUnique({
      where: { teamMembershipId: assignTeamLeaderDto.teamMembershipId },
      include: {
        eventMember: true,
      },
    });

    if (!teamMembership) {
      throw new NotFoundException('Team membership not found');
    }

    if (teamMembership.teamId !== teamId) {
      throw new BadRequestException('Selected leader does not belong to this team');
    }

    if (teamMembership.eventMember.eventId !== team.eventId) {
      throw new BadRequestException('Selected leader does not belong to the same event');
    }

    const existingLeaderForOtherTeam = await this.prisma.team.findUnique({
      where: { leaderMembershipId: assignTeamLeaderDto.teamMembershipId },
    });

    if (existingLeaderForOtherTeam && existingLeaderForOtherTeam.teamId !== teamId) {
      throw new ConflictException('This team member is already leading another team');
    }

    return this.prisma.team.update({
      where: { teamId },
      data: {
        leaderMembershipId: assignTeamLeaderDto.teamMembershipId,
      },
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
      },
    });
  }

  /**
   * 7. Remove Team Leader
   * DELETE /teams/:teamId/leader
   */
  async removeTeamLeader(teamId: string, userId: string) {
    await this.verifyTeamAndOrganizerAccess(teamId, userId);

    return this.prisma.team.update({
      where: { teamId },
      data: {
        leaderMembershipId: null,
      },
    });
  }

  /**
   * 8. Get My Team
   * GET /teams/my
   */
  async getMyTeam(userId: string, eventId?: string) {
    const whereClause: any = {
      eventMember: {
        userId,
      },
    };

    if (eventId) {
      whereClause.eventMember.eventId = eventId;
    }

    const memberships = await this.prisma.teamMembership.findMany({
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
              },
            },
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
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!memberships || memberships.length === 0) {
      throw new NotFoundException('You are not assigned to any team');
    }

    // Return primary team or list depending on query
    if (eventId || memberships.length === 1) {
      const team = memberships[0].team;
      const leaderUser = team.leader?.eventMember?.user;
      const leaderName = leaderUser
        ? `${leaderUser.firstName} ${leaderUser.lastName}`
        : null;

      const leaderInfo = team.leader && leaderUser
        ? {
          teamMembershipId: team.leader.teamMembershipId,
          eventMemberId: team.leader.eventMemberId,
          user: leaderUser,
        }
        : null;

      return {
        teamId: team.teamId,
        eventId: team.eventId,
        teamName: team.teamName,
        description: team.description,
        leaderMembershipId: team.leaderMembershipId,
        leaderName,
        leader: leaderInfo,
        event: team.event,
        memberCount: team._count.members,
        taskCount: team._count.tasks,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      };
    }

    return memberships.map((m) => {
      const team = m.team;
      const leaderUser = team.leader?.eventMember?.user;
      const leaderName = leaderUser
        ? `${leaderUser.firstName} ${leaderUser.lastName}`
        : null;

      const leaderInfo = team.leader && leaderUser
        ? {
          teamMembershipId: team.leader.teamMembershipId,
          eventMemberId: team.leader.eventMemberId,
          user: leaderUser,
        }
        : null;

      return {
        teamId: team.teamId,
        eventId: team.eventId,
        teamName: team.teamName,
        description: team.description,
        leaderMembershipId: team.leaderMembershipId,
        leaderName,
        leader: leaderInfo,
        event: team.event,
        memberCount: team._count.members,
        taskCount: team._count.tasks,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      };
    });
  }
}
