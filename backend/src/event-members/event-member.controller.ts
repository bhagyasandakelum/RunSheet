import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchMembersDto } from './dto/search-members.dto';
import { EventMemberService } from './event-member.service';

@UseGuards(JwtAuthGuard)
@Controller('events/:eventId')
export class EventMemberController {
  constructor(private readonly eventMemberService: EventMemberService) {}

  @Get('members')
  @HttpCode(HttpStatus.OK)
  async getEventMembers(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventMemberService.getEventMembers(eventId, user.userId);
  }

  @Get('members/search')
  @HttpCode(HttpStatus.OK)
  async searchMembers(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
    @Query() searchDto: SearchMembersDto,
  ) {
    return this.eventMemberService.searchMembers(eventId, user.userId, searchDto);
  }

  @Get('membership')
  @HttpCode(HttpStatus.OK)
  async getMyMembership(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventMemberService.getMyMembership(eventId, user.userId);
  }

  @Get('members/:memberId')
  @HttpCode(HttpStatus.OK)
  async getMemberDetails(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventMemberService.getMemberDetails(eventId, memberId, user.userId);
  }

  @Delete('members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventMemberService.removeMember(eventId, memberId, user.userId);
  }
}
