import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamMembershipController } from './team-membership.controller';
import { TeamMembershipService } from './team-membership.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeamMembershipController],
  providers: [TeamMembershipService],
  exports: [TeamMembershipService],
})
export class TeamMembershipModule {}
