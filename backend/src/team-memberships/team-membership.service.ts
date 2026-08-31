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

    if (!isOrganizer && !isLeader) {
      throw new ForbiddenException(
        'Only the event organizer or team leader can assign members to this team',
      );
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

    let targetEventMemberId = addMemberDto.eventMemberId;

    if (!targetEventMemberId) {
      let targetUserId = addMemberDto.userId;

      if (!targetUserId && addMemberDto.email) {
        const userByEmail = await this.prisma.user.findUnique({
          where: { email: addMemberDto.email.toLowerCase().trim() },
        });
        if (!userByEmail) {
          throw new NotFoundException('User with specified email not found');
        }
        targetUserId = userByEmail.userId;
      }

      if (!targetUserId) {
        throw new BadRequestException('Must provide eventMemberId, userId, or email');
      }

      if (targetUserId === team.event.organizerId) {
        // Organizer adding themselves
        let eventMember = await this.prisma.eventMember.findUnique({
          where: {
            eventId_userId: {
              eventId: team.eventId,
              userId: targetUserId,
            },
          },
        });

        if (!eventMember) {
          eventMember = await this.prisma.eventMember.create({
            data: {
              eventId: team.eventId,
              userId: targetUserId,
            },
          });
        }
        targetEventMemberId = eventMember.eventMemberId;
      } else {
        // Check if user is already an accepted EventMember
        const existingEventMember = await this.prisma.eventMember.findUnique({
          where: {
            eventId_userId: {
              eventId: team.eventId,
              userId: targetUserId,
            },
          },
        });

        if (existingEventMember) {
          targetEventMemberId = existingEventMember.eventMemberId;
        } else {
          // Send an invitation to the user so they must accept before gaining access
          const existingInvitation = await this.prisma.invitation.findFirst({
            where: {
              eventId: team.eventId,
              userId: targetUserId,
            },
          });

          if (existingInvitation && existingInvitation.status === 'Pending' && existingInvitation.expiresAt > new Date()) {
            return {
              status: 'InvitationPending',
              message: 'An invitation is already pending for this user. They will join the team once they accept it.',
              invitationId: existingInvitation.invitationId,
            };
          }

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 3);

          if (existingInvitation) {
            await this.prisma.invitation.update({
              where: { invitationId: existingInvitation.invitationId },
              data: {
                status: 'Pending',
                expiresAt,
              },
            });
          } else {
            await this.prisma.invitation.create({
              data: {
                eventId: team.eventId,
                userId: targetUserId,
                status: 'Pending',
                expiresAt,
              },
            });
          }

          return {
            status: 'InvitationSent',
            message: 'Invitation sent to user. They will join the team once they accept the invitation in their dashboard.',
          };
        }
      }
    } else {
      const eventMember = await this.prisma.eventMember.findUnique({
        where: { eventMemberId: targetEventMemberId },
      });

      if (!eventMember) {
        throw new NotFoundException('Event member not found');
      }

      if (eventMember.eventId !== team.eventId) {
        throw new BadRequestException('Selected member does not belong to this event');
      }
    }

    const existingMembership = await this.prisma.teamMembership.findUnique({
      where: { eventMemberId: targetEventMemberId },
    });

    if (existingMembership) {
      throw new ConflictException(
        'This member is already assigned to a team in this event. Transfer or remove them first.',
      );
    }

    return this.prisma.teamMembership.create({
      data: {
        teamId,
        eventMemberId: targetEventMemberId,
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

    const members: TeamMemberListItem[] = memberships.map((m) => {
      const isLeader = team.leaderMembershipId === m.teamMembershipId;
      const userObj = {
        userId: m.eventMember.user.userId,
        firstName: m.eventMember.user.firstName,
        lastName: m.eventMember.user.lastName,
        email: m.eventMember.user.email,
        profilePhotoUrl: m.eventMember.user.profilePhotoUrl,
      };

      return {
        teamMembershipId: m.teamMembershipId,
        eventMemberId: m.eventMemberId,
        firstName: m.eventMember.user.firstName,
        lastName: m.eventMember.user.lastName,
        email: m.eventMember.user.email,
        profilePhotoUrl: m.eventMember.user.profilePhotoUrl,
        joinedAt: m.joinedAt,
        isLeader,
        user: userObj,
        eventMember: {
          eventMemberId: m.eventMemberId,
          user: userObj,
        },
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
            leader: {
              include: {
                eventMember: true,
              },
            },
          },
        },
        eventMember: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Team membership not found');
    }

    const isOrganizer = membership.team.event.organizerId === userId;
    const isLeader = membership.team.leader?.eventMember?.userId === userId;

    if (!isOrganizer && !isLeader) {
      throw new ForbiddenException(
        'Only the event organizer or team leader can remove members from this team',
      );
    }

    // Team leader cannot remove the organizer or themselves (only organizer can reassign leader)
    if (!isOrganizer && membership.eventMember.userId === membership.team.event.organizerId) {
      throw new ForbiddenException('Cannot remove the event organizer from the team');
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

      // Delete task assignments for this membership
      await tx.taskAssignment.deleteMany({
        where: { teamMembershipId: membershipId },
      });

      await tx.teamMembership.delete({
        where: { teamMembershipId: membershipId },
      });

      // If user is not the organizer, remove their EventMember record to fully revoke event access
      if (membership.eventMember.userId !== membership.team.event.organizerId) {
        await tx.eventMember.delete({
          where: { eventMemberId: membership.eventMemberId },
        });

        await tx.invitation.deleteMany({
          where: {
            eventId: membership.team.eventId,
            userId: membership.eventMember.userId,
          },
        });
      }
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
