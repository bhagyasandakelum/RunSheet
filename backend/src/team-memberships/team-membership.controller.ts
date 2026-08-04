import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { TeamMembershipService } from './team-membership.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TeamMembershipController {
  constructor(private readonly teamMembershipService: TeamMembershipService) {}

  @Post('teams/:teamId/members')
  @HttpCode(HttpStatus.CREATED)
  async addMemberToTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.teamMembershipService.addMemberToTeam(
      teamId,
      user.userId,
      addMemberDto,
    );
  }

  @Get('teams/:teamId/members')
  @HttpCode(HttpStatus.OK)
  async getTeamMembers(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamMembershipService.getTeamMembers(teamId, user.userId);
  }

  @Get('teams/:teamId/statistics')
  @HttpCode(HttpStatus.OK)
  async getTeamStatistics(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamMembershipService.getTeamStatistics(teamId, user.userId);
  }

  @Get('team-memberships/me')
  @HttpCode(HttpStatus.OK)
  async getMyTeamMembership(
    @CurrentUser() user: any,
    @Query('eventId') eventId?: string,
  ) {
    return this.teamMembershipService.getMyTeamMembership(user.userId, eventId);
  }

  @Get('team-memberships/:id')
  @HttpCode(HttpStatus.OK)
  async getTeamMembershipDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.teamMembershipService.getTeamMembershipDetails(id, user.userId);
  }

  @Patch('team-memberships/:id/transfer')
  @HttpCode(HttpStatus.OK)
  async transferMember(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() transferDto: TransferMemberDto,
  ) {
    return this.teamMembershipService.transferMember(id, user.userId, transferDto);
  }

  @Delete('team-memberships/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.teamMembershipService.removeMember(id, user.userId);
  }

  @Get('events/:eventId/unassigned-members')
  @HttpCode(HttpStatus.OK)
  async getUnassignedMembers(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamMembershipService.getUnassignedMembers(eventId, user.userId);
  }
}
