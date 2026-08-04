import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationEmailService } from './notification.email.service';
import { NotificationScheduler } from './notification.scheduler';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationEmailService,
    NotificationScheduler,
  ],
  exports: [NotificationService, NotificationEmailService],
})
export class NotificationModule {}
