import { Module } from '@nestjs/common';
import { EventMemberController } from './event-member.controller';
import { EventMemberService } from './event-member.service';

@Module({
  controllers: [EventMemberController],
  providers: [EventMemberService],
  exports: [EventMemberService],
})
export class EventMemberModule {}
