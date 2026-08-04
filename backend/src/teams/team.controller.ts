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
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AssignTeamLeaderDto } from './dto/assign-team-leader.dto';
import { TeamService } from './team.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('events/:eventId/teams')
  @HttpCode(HttpStatus.CREATED)
  async createTeam(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    return this.teamService.createTeam(eventId, user.userId, createTeamDto);
  }

  @Get('events/:eventId/teams')
  @HttpCode(HttpStatus.OK)
  async getTeamsByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamService.getTeamsByEvent(eventId, user.userId);
  }

  @Get('teams/my')
  @HttpCode(HttpStatus.OK)
  async getMyTeam(
    @CurrentUser() user: any,
    @Query('eventId') eventId?: string,
  ) {
    return this.teamService.getMyTeam(user.userId, eventId);
  }

  @Get('teams/:teamId')
  @HttpCode(HttpStatus.OK)
  async getTeamDetails(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamService.getTeamDetails(teamId, user.userId);
  }

  @Patch('teams/:teamId')
  @HttpCode(HttpStatus.OK)
  async updateTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(teamId, user.userId, updateTeamDto);
  }

  @Delete('teams/:teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeam(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamService.deleteTeam(teamId, user.userId);
  }

  @Patch('teams/:teamId/leader')
  @HttpCode(HttpStatus.OK)
  async assignTeamLeader(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
    @Body() assignTeamLeaderDto: AssignTeamLeaderDto,
  ) {
    return this.teamService.assignTeamLeader(teamId, user.userId, assignTeamLeaderDto);
  }

  @Delete('teams/:teamId/leader')
  @HttpCode(HttpStatus.OK)
  async removeTeamLeader(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamService.removeTeamLeader(teamId, user.userId);
  }
}
