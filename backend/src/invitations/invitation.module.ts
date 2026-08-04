import { Module } from '@nestjs/common';
import { ConsoleEmailService } from './email/console-email.service';
import { EMAIL_SERVICE } from './interfaces/email-service.interface';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';

@Module({
  controllers: [InvitationController],
  providers: [
    InvitationService,
    {
      provide: EMAIL_SERVICE,
      useClass: ConsoleEmailService,
    },
  ],
  exports: [InvitationService],
})
export class InvitationModule {}
