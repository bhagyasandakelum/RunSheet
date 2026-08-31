import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { EMAIL_SERVICE, IEmailService } from './interfaces/email-service.interface';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async inviteUser(eventId: string, currentUserId: string, createDto: CreateInvitationDto) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
      include: {
        organizer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== currentUserId) {
      throw new ForbiddenException('Only the event organizer can invite users');
    }

    const teamCount = await this.prisma.team.count({
      where: { eventId },
    });

    if (teamCount === 0) {
      throw new BadRequestException(
        'Please create at least one team before inviting members to this event.',
      );
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (!invitedUser) {
      throw new NotFoundException('User with specified email not found');
    }

    if (invitedUser.userId === currentUserId) {
      throw new BadRequestException('Organizer cannot invite themselves');
    }

    const existingMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: invitedUser.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this event');
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        eventId,
        userId: invitedUser.userId,
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === InvitationStatus.Pending && existingInvitation.expiresAt <= new Date()) {
        await this.prisma.invitation.update({
          where: { invitationId: existingInvitation.invitationId },
          data: { status: InvitationStatus.Expired },
        });
      } else if (existingInvitation.status === InvitationStatus.Pending) {
        throw new ConflictException('User already has a pending invitation for this event');
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const invitation = await this.prisma.invitation.create({
      data: {
        eventId,
        userId: invitedUser.userId,
        status: InvitationStatus.Pending,
        expiresAt,
      },
    });

    const organizerMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUserId,
        },
      },
    });

    if (organizerMember) {
      await this.prisma.notification.create({
        data: {
          eventMemberId: organizerMember.eventMemberId,
          relatedEventId: eventId,
          title: 'Event Invitation Sent',
          message: `Invitation sent to ${invitedUser.email} for event ${event.eventName}`,
          notificationType: NotificationType.EventInvitation,
          expiresAt,
        },
      });
    }

    const organizerName = `${event.organizer.firstName} ${event.organizer.lastName}`;
    await this.emailService.sendInvitationEmail({
      toEmail: invitedUser.email,
      eventName: event.eventName,
      organizerName,
      message: createDto.message,
      expiresAt,
    });

    return invitation;
  }

  async getEventInvitations(eventId: string, currentUserId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== currentUserId) {
      throw new ForbiddenException('Only the event organizer can view event invitations');
    }

    await this.prisma.invitation.updateMany({
      where: {
        eventId,
        status: InvitationStatus.Pending,
        expiresAt: { lte: new Date() },
      },
      data: { status: InvitationStatus.Expired },
    });

    return this.prisma.invitation.findMany({
      where: { eventId },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvitations(currentUserId: string) {
    await this.prisma.invitation.updateMany({
      where: {
        userId: currentUserId,
        status: InvitationStatus.Pending,
        expiresAt: { lte: new Date() },
      },
      data: { status: InvitationStatus.Expired },
    });

    const invitations = await this.prisma.invitation.findMany({
      where: { userId: currentUserId },
      include: {
        event: {
          select: {
            eventId: true,
            eventName: true,
            description: true,
            venue: true,
            startDate: true,
            endDate: true,
            organizer: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      invitationId: inv.invitationId,
      eventId: inv.eventId,
      eventName: inv.event.eventName,
      eventVenue: inv.event.venue,
      eventStartDate: inv.event.startDate,
      eventEndDate: inv.event.endDate,
      eventDescription: inv.event.description,
      organizerName: `${inv.event.organizer.firstName} ${inv.event.organizer.lastName}`,
      organizerEmail: inv.event.organizer.email,
      event: inv.event,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      acceptedAt: inv.acceptedAt,
    }));
  }

  async acceptInvitation(invitationId: string, currentUserId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { invitationId },
      include: {
        event: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== currentUserId) {
      throw new ForbiddenException('You can only accept your own invitations');
    }

    if (invitation.status === InvitationStatus.Pending && invitation.expiresAt <= new Date()) {
      await this.prisma.invitation.update({
        where: { invitationId },
        data: { status: InvitationStatus.Expired },
      });
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException(`Cannot accept invitation with status ${invitation.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInvitation = await tx.invitation.update({
        where: { invitationId },
        data: {
          status: InvitationStatus.Accepted,
          acceptedAt: new Date(),
        },
      });

      let member = await tx.eventMember.findUnique({
        where: {
          eventId_userId: {
            eventId: invitation.eventId,
            userId: currentUserId,
          },
        },
      });

      if (!member) {
        member = await tx.eventMember.create({
          data: {
            eventId: invitation.eventId,
            userId: currentUserId,
          },
        });
      }

      // Check if user already has a team membership for this event
      const existingTeamMembership = await tx.teamMembership.findUnique({
        where: { eventMemberId: member.eventMemberId },
      });

      if (!existingTeamMembership) {
        const eventTeams = await tx.team.findMany({
          where: { eventId: invitation.eventId },
          orderBy: { createdAt: 'asc' },
          take: 1,
        });

        if (eventTeams.length > 0) {
          await tx.teamMembership.create({
            data: {
              teamId: eventTeams[0].teamId,
              eventMemberId: member.eventMemberId,
            },
          });
        }
      }

      const notifExpiresAt = new Date();
      notifExpiresAt.setDate(notifExpiresAt.getDate() + 7);

      await tx.notification.create({
        data: {
          eventMemberId: member.eventMemberId,
          relatedEventId: invitation.eventId,
          title: 'Invitation Accepted',
          message: `You successfully joined ${invitation.event.eventName}`,
          notificationType: NotificationType.GeneralAnnouncement,
          expiresAt: notifExpiresAt,
        },
      });

      return {
        message: 'Invitation accepted successfully',
        invitation: updatedInvitation,
        event: invitation.event,
      };
    });
  }

  async rejectInvitation(invitationId: string, currentUserId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== currentUserId) {
      throw new ForbiddenException('You can only reject your own invitations');
    }

    if (invitation.status === InvitationStatus.Pending && invitation.expiresAt <= new Date()) {
      await this.prisma.invitation.update({
        where: { invitationId },
        data: { status: InvitationStatus.Expired },
      });
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.status !== InvitationStatus.Pending) {
      throw new BadRequestException(`Cannot reject invitation with status ${invitation.status}`);
    }

    await this.prisma.invitation.update({
      where: { invitationId },
      data: { status: InvitationStatus.Rejected },
    });

    return { message: 'Invitation rejected successfully' };
  }

  async getInvitationDetails(invitationId: string, currentUserId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { invitationId },
      include: {
        event: {
          include: {
            organizer: {
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
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== currentUserId && invitation.event.organizerId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to view this invitation');
    }

    if (invitation.status === InvitationStatus.Pending && invitation.expiresAt <= new Date()) {
      await this.prisma.invitation.update({
        where: { invitationId },
        data: { status: InvitationStatus.Expired },
      });
      invitation.status = InvitationStatus.Expired;
    }

    return invitation;
  }
}
