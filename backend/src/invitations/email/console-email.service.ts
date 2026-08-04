import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, SendInvitationEmailPayload } from '../interfaces/email-service.interface';

@Injectable()
export class ConsoleEmailService implements IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async sendInvitationEmail(payload: SendInvitationEmailPayload): Promise<void> {
    this.logger.log(`
--- INVITATION EMAIL SENT ---
To: ${payload.toEmail}
Event Name: ${payload.eventName}
Organizer: ${payload.organizerName}
Message: ${payload.message || 'No additional message'}
Expires At: ${payload.expiresAt.toISOString()}
-----------------------------
    `);
  }
}
