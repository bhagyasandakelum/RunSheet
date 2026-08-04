import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationService } from './invitation.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('events/:eventId/invitations')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
    @Body() createDto: CreateInvitationDto,
  ) {
    return this.invitationService.inviteUser(eventId, user.userId, createDto);
  }

  @Get('events/:eventId/invitations')
  @HttpCode(HttpStatus.OK)
  async getEventInvitations(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationService.getEventInvitations(eventId, user.userId);
  }

  @Get('invitations')
  @HttpCode(HttpStatus.OK)
  async getMyInvitations(@CurrentUser() user: any) {
    return this.invitationService.getMyInvitations(user.userId);
  }

  @Get('invitations/:id')
  @HttpCode(HttpStatus.OK)
  async getInvitationDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationService.getInvitationDetails(id, user.userId);
  }

  @Post('invitations/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationService.acceptInvitation(id, user.userId);
  }

  @Post('invitations/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.invitationService.rejectInvitation(id, user.userId);
  }
}
