export interface SendInvitationEmailPayload {
  toEmail: string;
  eventName: string;
  organizerName: string;
  message?: string;
  expiresAt: Date;
}

export interface IEmailService {
  sendInvitationEmail(payload: SendInvitationEmailPayload): Promise<void>;
}

export const EMAIL_SERVICE = 'IEmailService';
