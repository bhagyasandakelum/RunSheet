import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';
import { NotificationEmailService } from './notification.email.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaMock: any;
  let emailServiceMock: any;

  const mockUser = {
    userId: 'user-uuid-1',
    firstName: 'Emma',
    lastName: 'Watson',
    email: 'emma@example.com',
  };

  const mockEvent = {
    eventId: 'event-uuid-1',
    organizerId: 'user-uuid-1',
    eventName: 'Annual Conference 2026',
  };

  const mockEventMember = {
    eventMemberId: 'em-uuid-1',
    eventId: 'event-uuid-1',
    userId: 'user-uuid-1',
    user: mockUser,
  };

  const mockNotification = {
    notificationId: 'notif-uuid-1',
    eventMemberId: 'em-uuid-1',
    relatedEventId: 'event-uuid-1',
    relatedTaskId: null,
    title: 'General Announcement',
    message: 'Welcome to the conference!',
    notificationType: NotificationType.GeneralAnnouncement,
    isRead: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    eventMember: mockEventMember,
    relatedEvent: mockEvent,
    relatedTask: null,
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
      notification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    emailServiceMock = {
      sendEmail: jest.fn(),
      sendEventInvitation: jest.fn(),
      sendTeamInvitation: jest.fn(),
      sendTaskAssigned: jest.fn(),
      sendDeadlineReminder: jest.fn(),
      sendTaskOverdue: jest.fn(),
      sendTaskCompleted: jest.fn(),
      sendAnnouncement: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: NotificationEmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should return paginated notifications for user', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.notification.count.mockResolvedValue(1);
      prismaMock.notification.findMany.mockResolvedValue([mockNotification]);

      const result = await service.getMyNotifications('user-uuid-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty list if user is not in any event', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([]);

      const result = await service.getMyNotifications('user-uuid-1', {});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getNotificationDetails', () => {
    it('should return details for owner', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);

      const details = await service.getNotificationDetails('notif-uuid-1', 'user-uuid-1');

      expect(details.notificationId).toBe('notif-uuid-1');
      expect(details.title).toBe('General Announcement');
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);

      await expect(
        service.getNotificationDetails('notif-uuid-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.getNotificationDetails('invalid-id', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read for owner', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
      prismaMock.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const updated = await service.markAsRead('notif-uuid-1', 'user-uuid-1');

      expect(updated.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-uuid-1');

      expect(result.count).toBe(5);
    });
  });

  describe('deleteExpiredNotifications', () => {
    it('should delete expired notifications', async () => {
      prismaMock.notification.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.deleteExpiredNotifications('user-uuid-1');

      expect(result.deletedCount).toBe(3);
    });
  });

  describe('sendGeneralAnnouncement', () => {
    it('should broadcast announcement to all event members for organizer', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.notification.create.mockResolvedValue(mockNotification);

      const result = await service.sendGeneralAnnouncement('event-uuid-1', 'user-uuid-1', {
        title: 'Meeting Tomorrow',
        message: 'See you at 8am',
      });

      expect(result.recipientCount).toBe(1);
      expect(emailServiceMock.sendAnnouncement).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-organizer sends announcement', async () => {
      prismaMock.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.sendGeneralAnnouncement('event-uuid-1', 'other-user', {
          title: 'Meeting',
          message: 'Hello',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getNotificationStatistics', () => {
    it('should calculate notification statistics correctly', async () => {
      prismaMock.eventMember.findMany.mockResolvedValue([mockEventMember]);
      prismaMock.notification.findMany.mockResolvedValue([
        { isRead: true, notificationType: NotificationType.GeneralAnnouncement, expiresAt: new Date(Date.now() + 100000) },
        { isRead: false, notificationType: NotificationType.TaskAssigned, expiresAt: new Date(Date.now() + 100000) },
      ]);

      const stats = await service.getNotificationStatistics('user-uuid-1');

      expect(stats.totalNotifications).toBe(2);
      expect(stats.read).toBe(1);
      expect(stats.unread).toBe(1);
      expect(stats.byType[NotificationType.GeneralAnnouncement]).toBe(1);
      expect(stats.byType[NotificationType.TaskAssigned]).toBe(1);
    });
  });
});
