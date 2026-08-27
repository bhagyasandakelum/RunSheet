import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly allowedStatusTransitions: Record<EventStatus, EventStatus[]> = {
    [EventStatus.Draft]: [EventStatus.Planning, EventStatus.Cancelled],
    [EventStatus.Planning]: [EventStatus.Active, EventStatus.Cancelled],
    [EventStatus.Active]: [EventStatus.Completed, EventStatus.Cancelled],
    [EventStatus.Completed]: [EventStatus.Archived],
    [EventStatus.Cancelled]: [],
    [EventStatus.Archived]: [],
  };

  async createEvent(userId: string, createEventDto: CreateEventDto) {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          organizerId: userId,
          eventName: createEventDto.eventName,
          description: createEventDto.description,
          venue: createEventDto.venue,
          startDate,
          endDate,
          status: EventStatus.Draft,
        },
      });

      await tx.eventMember.create({
        data: {
          eventId: event.eventId,
          userId: userId,
        },
      });

      return event;
    });
  }

  async getMyEvents(userId: string) {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { organizerId: userId },
          { members: { some: { userId } } },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventDetails(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
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
        members: {
          where: { userId },
        },
        _count: {
          select: {
            members: true,
            teams: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isOrganizer = event.organizerId === userId;
    const isMember = event.members.length > 0;

    if (!isOrganizer && !isMember) {
      throw new ForbiddenException(
        'You must be a member or organizer of this event to view its details',
      );
    }

    const taskCount = await this.prisma.task.count({
      where: {
        team: {
          eventId: eventId,
        },
      },
    });

    const { _count, members, ...eventDetails } = event;

    return {
      ...eventDetails,
      memberCount: _count.members,
      teamCount: _count.teams,
      taskCount,
    };
  }

  async updateEvent(eventId: string, userId: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can edit this event');
    }

    if (
      event.status === EventStatus.Completed ||
      event.status === EventStatus.Archived ||
      event.status === EventStatus.Cancelled
    ) {
      throw new BadRequestException(
        'Cannot modify a completed, archived, or cancelled event',
      );
    }

    const startDate = updateEventDto.startDate ? new Date(updateEventDto.startDate) : event.startDate;
    const endDate = updateEventDto.endDate ? new Date(updateEventDto.endDate) : event.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    return this.prisma.event.update({
      where: { eventId },
      data: {
        ...(updateEventDto.eventName && { eventName: updateEventDto.eventName }),
        ...(updateEventDto.description !== undefined && { description: updateEventDto.description }),
        ...(updateEventDto.venue && { venue: updateEventDto.venue }),
        ...(updateEventDto.startDate && { startDate: new Date(updateEventDto.startDate) }),
        ...(updateEventDto.endDate && { endDate: new Date(updateEventDto.endDate) }),
      },
    });
  }

  async updateEventStatus(eventId: string, userId: string, updateEventStatusDto: UpdateEventStatusDto) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can change status for this event');
    }

    const currentStatus = event.status;
    const nextStatus = updateEventStatusDto.status;

    const allowed = this.allowedStatusTransitions[currentStatus];

    if (!allowed || !allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${nextStatus}`,
      );
    }

    return this.prisma.event.update({
      where: { eventId },
      data: { status: nextStatus },
    });
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can delete this event');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.event.delete({
        where: { eventId },
      });
    });
  }
}
