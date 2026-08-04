import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendAnnouncementDto } from './dto/send-announcement.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { NotificationEmailService } from './notification.email.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: NotificationEmailService,
  ) {}

  private get defaultExpirationDate(): Date {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days retention
  }

  /**
   * 1. Get My Notifications
   * GET /notifications
   */
  async getMyNotifications(userId: string, filterDto: NotificationFilterDto) {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      select: { eventMemberId: true },
    });

    const eventMemberIds = eventMembers.map((m) => m.eventMemberId);

    if (eventMemberIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const whereClause: any = {
      eventMemberId: { in: eventMemberIds },
      ...(filterDto.unreadOnly && { isRead: false }),
      ...(filterDto.notificationType && { notificationType: filterDto.notificationType }),
    };

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.findMany({
        where: whereClause,
        include: {
          relatedEvent: { select: { eventId: true, eventName: true } },
          relatedTask: { select: { taskId: true, taskTitle: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 2. Get Notification Details
   * GET /notifications/:id
   */
  async getNotificationDetails(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { notificationId },
      include: {
        eventMember: true,
        relatedEvent: true,
        relatedTask: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.eventMember.userId !== userId) {
      throw new ForbiddenException(
        'Only the owner of this notification can view its details',
      );
    }

    return {
      notificationId: notification.notificationId,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      expiresAt: notification.expiresAt,
      relatedEvent: notification.relatedEvent,
      relatedTask: notification.relatedTask,
    };
  }

  /**
   * 3. Mark Notification as Read
   * PATCH /notifications/:id/read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { notificationId },
      include: { eventMember: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.eventMember.userId !== userId) {
      throw new ForbiddenException(
        'Only the owner of this notification can mark it as read',
      );
    }

    return this.prisma.notification.update({
      where: { notificationId },
      data: { isRead: true },
    });
  }

  /**
   * 4. Mark All Notifications as Read
   * PATCH /notifications/read-all
   */
  async markAllAsRead(userId: string) {
    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      select: { eventMemberId: true },
    });

    const eventMemberIds = eventMembers.map((m) => m.eventMemberId);

    if (eventMemberIds.length === 0) {
      return { count: 0 };
    }

    const result = await this.prisma.notification.updateMany({
      where: {
        eventMemberId: { in: eventMemberIds },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  /**
   * 5. Delete Notification
   * DELETE /notifications/:id
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { notificationId },
      include: { eventMember: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.eventMember.userId !== userId) {
      throw new ForbiddenException(
        'Only the owner of this notification can delete it',
      );
    }

    await this.prisma.notification.delete({
      where: { notificationId },
    });
  }

  /**
   * 6. Delete Expired Notifications
   * DELETE /notifications/expired
   */
  async deleteExpiredNotifications(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return { deletedCount: result.count };
  }

  /**
   * 7. Send General Announcement
   * POST /events/:eventId/announcements
   */
  async sendGeneralAnnouncement(
    eventId: string,
    userId: string,
    announcementDto: SendAnnouncementDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the event organizer can send announcements');
    }

    const members = await this.prisma.eventMember.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const expiresAt = this.defaultExpirationDate;

    await this.prisma.$transaction(async (tx) => {
      for (const member of members) {
        await tx.notification.create({
          data: {
            eventMemberId: member.eventMemberId,
            relatedEventId: eventId,
            title: announcementDto.title,
            message: announcementDto.message,
            notificationType: NotificationType.GeneralAnnouncement,
            expiresAt,
          },
        });
      }
    });

    // Send emails asynchronously
    for (const member of members) {
      this.emailService.sendAnnouncement(
        member.user.email,
        `${member.user.firstName} ${member.user.lastName}`,
        announcementDto.title,
        announcementDto.message,
        event.eventName,
      ).catch(() => {});
    }

    return {
      message: 'Announcement broadcasted successfully',
      recipientCount: members.length,
    };
  }

  /**
   * 8. Get Notification Statistics
   * GET /notifications/statistics
   */
  async getNotificationStatistics(userId: string) {
    const eventMembers = await this.prisma.eventMember.findMany({
      where: { userId },
      select: { eventMemberId: true },
    });

    const eventMemberIds = eventMembers.map((m) => m.eventMemberId);

    const notifications = await this.prisma.notification.findMany({
      where: {
        eventMemberId: { in: eventMemberIds },
      },
      select: {
        isRead: true,
        notificationType: true,
        expiresAt: true,
      },
    });

    const now = new Date();
    const totalNotifications = notifications.length;
    const read = notifications.filter((n) => n.isRead).length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const expired = notifications.filter((n) => n.expiresAt < now).length;

    const byType: Record<string, number> = {};
    for (const type of Object.keys(NotificationType)) {
      byType[type] = notifications.filter((n) => n.notificationType === type).length;
    }

    return {
      totalNotifications,
      read,
      unread,
      expired,
      byType,
    };
  }

  // ======================================================
  // INTERNAL HELPER METHODS (Cross-Module Calls)
  // ======================================================

  async createTaskAssignedNotification(
    eventMemberId: string,
    taskId: string,
    taskTitle: string,
    assignerName: string,
  ) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId },
      include: { user: true },
    });

    if (!member) return;

    const notification = await this.prisma.notification.create({
      data: {
        eventMemberId,
        relatedTaskId: taskId,
        title: 'New Task Assigned',
        message: `You have been assigned to task "${taskTitle}" by ${assignerName}.`,
        notificationType: NotificationType.TaskAssigned,
        expiresAt: this.defaultExpirationDate,
      },
    });

    this.emailService.sendTaskAssigned(
      member.user.email,
      `${member.user.firstName} ${member.user.lastName}`,
      taskTitle,
      assignerName,
    ).catch(() => {});

    return notification;
  }

  async createTaskCompletedNotification(
    taskId: string,
    taskTitle: string,
    eventId: string,
    completedByName: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { eventId },
    });

    if (!event) return;

    const organizerMember = await this.prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: event.organizerId,
        },
      },
      include: { user: true },
    });

    if (organizerMember) {
      await this.prisma.notification.create({
        data: {
          eventMemberId: organizerMember.eventMemberId,
          relatedEventId: eventId,
          relatedTaskId: taskId,
          title: 'Task Completed',
          message: `The task "${taskTitle}" has been completed by ${completedByName}.`,
          notificationType: NotificationType.TaskCompleted,
          expiresAt: this.defaultExpirationDate,
        },
      });

      this.emailService.sendTaskCompleted(
        organizerMember.user.email,
        `${organizerMember.user.firstName} ${organizerMember.user.lastName}`,
        taskTitle,
        completedByName,
      ).catch(() => {});
    }
  }

  async createDeadlineReminder(
    eventMemberId: string,
    taskId: string,
    taskTitle: string,
    dueDate: Date,
  ) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId },
      include: { user: true },
    });

    if (!member) return;

    const notification = await this.prisma.notification.create({
      data: {
        eventMemberId,
        relatedTaskId: taskId,
        title: 'Task Deadline Reminder',
        message: `Task "${taskTitle}" is due on ${dueDate.toISOString().split('T')[0]}.`,
        notificationType: NotificationType.DeadlineReminder,
        expiresAt: this.defaultExpirationDate,
      },
    });

    this.emailService.sendDeadlineReminder(
      member.user.email,
      `${member.user.firstName} ${member.user.lastName}`,
      taskTitle,
      dueDate,
    ).catch(() => {});

    return notification;
  }

  async createOverdueNotification(
    eventMemberId: string,
    taskId: string,
    taskTitle: string,
    dueDate: Date,
  ) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId },
      include: { user: true },
    });

    if (!member) return;

    const notification = await this.prisma.notification.create({
      data: {
        eventMemberId,
        relatedTaskId: taskId,
        title: 'Task Overdue Alert',
        message: `Task "${taskTitle}" is overdue! Was due on ${dueDate.toISOString().split('T')[0]}.`,
        notificationType: NotificationType.TaskOverdue,
        expiresAt: this.defaultExpirationDate,
      },
    });

    this.emailService.sendTaskOverdue(
      member.user.email,
      `${member.user.firstName} ${member.user.lastName}`,
      taskTitle,
      dueDate,
    ).catch(() => {});

    return notification;
  }

  async createInvitationNotification(
    eventMemberId: string,
    eventId: string,
    eventName: string,
    organizerName: string,
  ) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId },
      include: { user: true },
    });

    if (!member) return;

    return this.prisma.notification.create({
      data: {
        eventMemberId,
        relatedEventId: eventId,
        title: 'Event Invitation',
        message: `You have been invited to join event "${eventName}" by ${organizerName}.`,
        notificationType: NotificationType.EventInvitation,
        expiresAt: this.defaultExpirationDate,
      },
    });
  }

  async createTeamInvitationNotification(
    eventMemberId: string,
    teamId: string,
    teamName: string,
    eventId: string,
  ) {
    const member = await this.prisma.eventMember.findUnique({
      where: { eventMemberId },
      include: { user: true },
    });

    if (!member) return;

    return this.prisma.notification.create({
      data: {
        eventMemberId,
        relatedEventId: eventId,
        title: 'Team Assignment',
        message: `You have been assigned to team "${teamName}".`,
        notificationType: NotificationType.TeamInvitation,
        expiresAt: this.defaultExpirationDate,
      },
    });
  }
}
