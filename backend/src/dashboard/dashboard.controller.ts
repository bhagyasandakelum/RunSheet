import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { MyNotificationsFilterDto } from './dto/my-notifications-filter.dto';
import { MyTasksFilterDto } from './dto/my-tasks-filter.dto';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/me
   * Returns dashboard for logged-in member.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMemberDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getMemberDashboard(user.userId);
  }

  /**
   * GET /dashboard/me/tasks
   * Returns all task assignments belonging to logged-in member with filtering, search, sorting, and pagination.
   */
  @Get('me/tasks')
  @HttpCode(HttpStatus.OK)
  async getMyTasks(
    @CurrentUser() user: any,
    @Query() filterDto: MyTasksFilterDto,
  ) {
    return this.dashboardService.getMyTasks(user.userId, filterDto);
  }

  /**
   * GET /dashboard/me/notifications
   * Returns latest notifications for logged-in member.
   */
  @Get('me/notifications')
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query() filterDto: MyNotificationsFilterDto,
  ) {
    return this.dashboardService.getMyNotifications(user.userId, filterDto);
  }

  /**
   * GET /dashboard/events/:eventId
   * Comprehensive Organizer Dashboard. Requires requester to be Event Organizer.
   */
  @Get('events/:eventId')
  @HttpCode(HttpStatus.OK)
  async getOrganizerDashboard(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getOrganizerDashboard(eventId, user.userId);
  }

  /**
   * GET /dashboard/events/:eventId/statistics
   * Returns high-level event statistics for pie charts / metrics cards.
   */
  @Get('events/:eventId/statistics')
  @HttpCode(HttpStatus.OK)
  async getEventStatistics(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getEventStatistics(eventId, user.userId);
  }

  /**
   * GET /dashboard/events/:eventId/team-analytics
   * Returns per-team progress analytics.
   */
  @Get('events/:eventId/team-analytics')
  @HttpCode(HttpStatus.OK)
  async getTeamAnalytics(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getTeamAnalytics(eventId, user.userId);
  }

  /**
   * GET /dashboard/events/:eventId/task-analytics
   * Returns grouped task counts by status.
   */
  @Get('events/:eventId/task-analytics')
  @HttpCode(HttpStatus.OK)
  async getTaskAnalytics(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getTaskAnalytics(eventId, user.userId);
  }

  /**
   * GET /dashboard/events/:eventId/timeline
   * Returns chronological activity feed. Maximum 50 records. Newest first.
   */
  @Get('events/:eventId/timeline')
  @HttpCode(HttpStatus.OK)
  async getTimeline(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getTimeline(eventId, user.userId);
  }
}
