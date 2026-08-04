import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Deadline Reminder Cron Job
   * Runs every hour. Finds tasks due within next 3 days.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDeadlineReminders() {
    this.logger.log('Running Deadline Reminder Cron Job...');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
        status: {
          notIn: [TaskStatus.Completed, TaskStatus.Cancelled],
        },
      },
      include: {
        assignments: {
          include: {
            teamMembership: true,
          },
        },
      },
    });

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const task of upcomingTasks) {
      if (!task.dueDate) continue;

      for (const assignment of task.assignments) {
        const eventMemberId = assignment.teamMembership.eventMemberId;

        // Check for duplicate reminder in last 24h
        const existingReminder = await this.prisma.notification.findFirst({
          where: {
            eventMemberId,
            relatedTaskId: task.taskId,
            notificationType: NotificationType.DeadlineReminder,
            createdAt: { gte: twentyFourHoursAgo },
          },
        });

        if (!existingReminder) {
          await this.notificationService.createDeadlineReminder(
            eventMemberId,
            task.taskId,
            task.taskTitle,
            task.dueDate,
          );
        }
      }
    }
  }

  /**
   * Overdue Tasks Cron Job
   * Runs every hour. Finds tasks past due date.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueTasks() {
    this.logger.log('Running Overdue Tasks Cron Job...');

    const now = new Date();

    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          notIn: [TaskStatus.Completed, TaskStatus.Cancelled],
        },
      },
      include: {
        assignments: {
          include: {
            teamMembership: true,
          },
        },
      },
    });

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const task of overdueTasks) {
      if (!task.dueDate) continue;

      for (const assignment of task.assignments) {
        const eventMemberId = assignment.teamMembership.eventMemberId;

        const existingOverdueNotification = await this.prisma.notification.findFirst({
          where: {
            eventMemberId,
            relatedTaskId: task.taskId,
            notificationType: NotificationType.TaskOverdue,
            createdAt: { gte: twentyFourHoursAgo },
          },
        });

        if (!existingOverdueNotification) {
          await this.notificationService.createOverdueNotification(
            eventMemberId,
            task.taskId,
            task.taskTitle,
            task.dueDate,
          );
        }
      }
    }
  }

  /**
   * Expired Notifications Cleanup Cron Job
   * Runs daily at midnight. Deletes notifications where expiresAt < now().
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanupExpired() {
    this.logger.log('Running Expired Notifications Cleanup Cron Job...');

    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleanup completed. Deleted ${result.count} expired notifications.`);
  }
}
