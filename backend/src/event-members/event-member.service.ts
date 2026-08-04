import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchMembersDto } from './dto/search-members.dto';

@Injectable()
export class EventMemberService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyEventAccess(eventId: string, currentUserId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isOrganizer = event.organizerId === currentUserId;
    const isMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUserId,
        },
      },
    });

    if (!isOrganizer && !isMember) {
      throw new ForbiddenException(
        'You must be a member or organizer of this event to access member information',
      );
    }

    return { event, isOrganizer };
  }

  async getEventMembers(eventId: string, currentUserId: string) {
    const { event } = await this.verifyEventAccess(eventId, currentUserId);

    const members = await this.prisma.eventMember.findMany({
      where: { eventId },
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
        teamMembership: {
          include: {
            team: true,
            leadingTeam: true,
          },
        },
      },
    });

    const formattedMembers = members.map((m) => {
      const isOrganizer = m.userId === event.organizerId;
      const isTeamLeader = !!m.teamMembership?.leadingTeam;
      const teamName = m.teamMembership?.team?.teamName || null;

      return {
        eventMemberId: m.eventMemberId,
        userId: m.user.userId,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        phoneNumber: m.user.phoneNumber,
        profilePhotoUrl: m.user.profilePhotoUrl,
        joinedAt: m.joinedAt,
        teamName,
        isTeamLeader,
        isOrganizer,
      };
    });

    formattedMembers.sort((a, b) => {
      if (a.isOrganizer && !b.isOrganizer) return -1;
      if (!a.isOrganizer && b.isOrganizer) return 1;

      if (a.isTeamLeader && !b.isTeamLeader) return -1;
      if (!a.isTeamLeader && b.isTeamLeader) return 1;

      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return formattedMembers;
  }

  async getMemberDetails(eventId: string, memberId: string, currentUserId: string) {
    const { event } = await this.verifyEventAccess(eventId, currentUserId);

    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId: memberId },
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
        teamMembership: {
          include: {
            team: {
              select: {
                teamId: true,
                teamName: true,
                description: true,
              },
            },
            leadingTeam: true,
            assignedTasks: true,
          },
        },
      },
    });

    if (!member || member.eventId !== eventId) {
      throw new NotFoundException('Event member not found');
    }

    const assignedTasks = member.teamMembership?.assignedTasks || [];
    const assignedTaskCount = assignedTasks.length;
    const completedAssignmentCount = assignedTasks.filter(
      (t) => t.assignmentStatus === 'Completed',
    ).length;

    return {
      eventMemberId: member.eventMemberId,
      user: member.user,
      joinedAt: member.joinedAt,
      team: member.teamMembership?.team || null,
      isTeamLeader: !!member.teamMembership?.leadingTeam,
      isOrganizer: member.userId === event.organizerId,
      assignedTaskCount,
      completedAssignmentCount,
    };
  }

  async getMyMembership(eventId: string, currentUserId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const membership = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUserId,
        },
      },
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
        teamMembership: {
          include: {
            team: true,
            leadingTeam: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this event');
    }

    return {
      eventMemberId: membership.eventMemberId,
      eventId: membership.eventId,
      user: membership.user,
      joinedAt: membership.joinedAt,
      team: membership.teamMembership?.team || null,
      isTeamLeader: !!membership.teamMembership?.leadingTeam,
      isOrganizer: membership.userId === event.organizerId,
    };
  }

  async removeMember(eventId: string, memberId: string, currentUserId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== currentUserId) {
      throw new ForbiddenException('Only the event organizer can remove members');
    }

    if (event.status === EventStatus.Completed || event.status === EventStatus.Archived) {
      throw new BadRequestException('Cannot remove members from completed or archived events');
    }

    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId: memberId },
      include: {
        teamMembership: {
          include: {
            leadingTeam: true,
          },
        },
      },
    });

    if (!member || member.eventId !== eventId) {
      throw new NotFoundException('Event member not found');
    }

    if (member.userId === event.organizerId) {
      throw new BadRequestException('Organizer cannot remove themselves from the event');
    }

    return this.prisma.$transaction(async (tx) => {
      if (member.teamMembership?.leadingTeam) {
        await tx.team.update({
          where: { teamId: member.teamMembership.leadingTeam.teamId },
          data: { leaderMembershipId: null },
        });
      }

      if (member.teamMembership) {
        await tx.teamMembership.delete({
          where: { teamMembershipId: member.teamMembership.teamMembershipId },
        });
      }

      await tx.eventMember.delete({
        where: { eventMemberId: memberId },
      });

      return { message: 'Member removed successfully' };
    });
  }

  async searchMembers(eventId: string, currentUserId: string, searchDto: SearchMembersDto) {
    const { event } = await this.verifyEventAccess(eventId, currentUserId);

    const { name, email } = searchDto;

    const whereClause: any = {
      eventId,
    };

    const userConditions: any[] = [];

    if (name) {
      userConditions.push(
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } },
      );
    }

    if (email) {
      userConditions.push({ email: { contains: email, mode: 'insensitive' } });
    }

    if (userConditions.length > 0) {
      whereClause.user = {
        OR: userConditions,
      };
    }

    const members = await this.prisma.eventMember.findMany({
      where: whereClause,
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
        teamMembership: {
          include: {
            team: true,
            leadingTeam: true,
          },
        },
      },
    });

    const formattedMembers = members.map((m) => {
      const isOrganizer = m.userId === event.organizerId;
      const isTeamLeader = !!m.teamMembership?.leadingTeam;
      const teamName = m.teamMembership?.team?.teamName || null;

      return {
        eventMemberId: m.eventMemberId,
        userId: m.user.userId,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        phoneNumber: m.user.phoneNumber,
        profilePhotoUrl: m.user.profilePhotoUrl,
        joinedAt: m.joinedAt,
        teamName,
        isTeamLeader,
        isOrganizer,
      };
    });

    formattedMembers.sort((a, b) => {
      if (a.isOrganizer && !b.isOrganizer) return -1;
      if (!a.isOrganizer && b.isOrganizer) return 1;

      if (a.isTeamLeader && !b.isTeamLeader) return -1;
      if (!a.isTeamLeader && b.isTeamLeader) return 1;

      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return formattedMembers;
  }
}
