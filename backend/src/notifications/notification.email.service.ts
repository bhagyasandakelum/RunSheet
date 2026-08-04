import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailPayload {
  toEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

@Injectable()
export class NotificationEmailService {
  private readonly logger = new Logger(NotificationEmailService.name);

  async sendEmail(payload: SendEmailPayload): Promise<void> {
    this.logger.log(`
================ EMAIL NOTIFICATION SENT ================
To: ${payload.toEmail} (${payload.recipientName})
Subject: ${payload.subject}
Message: ${payload.bodyText}
=========================================================
    `);
  }

  async sendEventInvitation(toEmail: string, recipientName: string, eventName: string, organizerName: string, message?: string, expiresAt?: Date): Promise<void> {
    const subject = `Invitation to Event: ${eventName}`;
    const bodyText = `Hello ${recipientName}, you have been invited to join ${eventName} by ${organizerName}. ${message ? `Message: ${message}` : ''}`;
    const bodyHtml = `
      <h2>Event Invitation</h2>
      <p>Hello ${recipientName},</p>
      <p>You have been invited to join <strong>${eventName}</strong> by ${organizerName}.</p>
      ${message ? `<p><em>"${message}"</em></p>` : ''}
      ${expiresAt ? `<p>Expires At: ${expiresAt.toISOString()}</p>` : ''}
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendTeamInvitation(toEmail: string, recipientName: string, teamName: string, eventName: string): Promise<void> {
    const subject = `Assigned to Team: ${teamName}`;
    const bodyText = `Hello ${recipientName}, you have been assigned to team ${teamName} in event ${eventName}.`;
    const bodyHtml = `
      <h2>Team Assignment</h2>
      <p>Hello ${recipientName},</p>
      <p>You have been assigned to <strong>${teamName}</strong> in <strong>${eventName}</strong>.</p>
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendTaskAssigned(toEmail: string, recipientName: string, taskTitle: string, assignerName: string, dueDate?: Date | null): Promise<void> {
    const subject = `Task Assigned: ${taskTitle}`;
    const bodyText = `Hello ${recipientName}, you have been assigned to the task "${taskTitle}" by ${assignerName}. ${dueDate ? `Due date: ${dueDate.toISOString()}` : ''}`;
    const bodyHtml = `
      <h2>New Task Assigned</h2>
      <p>Hello ${recipientName},</p>
      <p>You have been assigned to the task <strong>${taskTitle}</strong> by ${assignerName}.</p>
      ${dueDate ? `<p>Due Date: ${dueDate.toISOString()}</p>` : ''}
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendDeadlineReminder(toEmail: string, recipientName: string, taskTitle: string, dueDate: Date): Promise<void> {
    const subject = `Deadline Reminder: ${taskTitle}`;
    const bodyText = `Hello ${recipientName}, reminder that your task "${taskTitle}" is due on ${dueDate.toISOString()}.`;
    const bodyHtml = `
      <h2>Task Deadline Reminder</h2>
      <p>Hello ${recipientName},</p>
      <p>Reminder that your task <strong>${taskTitle}</strong> is due on ${dueDate.toISOString()}.</p>
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendTaskOverdue(toEmail: string, recipientName: string, taskTitle: string, dueDate: Date): Promise<void> {
    const subject = `Task Overdue: ${taskTitle}`;
    const bodyText = `Hello ${recipientName}, your task "${taskTitle}" was due on ${dueDate.toISOString()} and is now overdue.`;
    const bodyHtml = `
      <h2>Task Overdue Alert</h2>
      <p>Hello ${recipientName},</p>
      <p>Your task <strong>${taskTitle}</strong> was due on ${dueDate.toISOString()} and is now overdue.</p>
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendTaskCompleted(toEmail: string, recipientName: string, taskTitle: string, completedByName: string): Promise<void> {
    const subject = `Task Completed: ${taskTitle}`;
    const bodyText = `Hello ${recipientName}, the task "${taskTitle}" has been completed by ${completedByName}.`;
    const bodyHtml = `
      <h2>Task Completed</h2>
      <p>Hello ${recipientName},</p>
      <p>The task <strong>${taskTitle}</strong> has been marked completed by ${completedByName}.</p>
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }

  async sendAnnouncement(toEmail: string, recipientName: string, title: string, message: string, eventName: string): Promise<void> {
    const subject = `Announcement [${eventName}]: ${title}`;
    const bodyText = `Hello ${recipientName}, Announcement: ${title} - ${message}`;
    const bodyHtml = `
      <h2>📢 Announcement: ${title}</h2>
      <p>Hello ${recipientName},</p>
      <p>Announcement for <strong>${eventName}</strong>:</p>
      <blockquote>${message}</blockquote>
    `;
    await this.sendEmail({ toEmail, recipientName, subject, bodyHtml, bodyText });
  }
}
