import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventModule } from './events/event.module';
import { InvitationModule } from './invitations/invitation.module';

@Module({
  imports: [PrismaModule, TestModule, AuthModule, UsersModule, EventModule, InvitationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
