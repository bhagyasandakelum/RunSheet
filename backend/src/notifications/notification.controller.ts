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
import { SendAnnouncementDto } from './dto/send-announcement.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query() filterDto: NotificationFilterDto,
  ) {
    return this.notificationService.getMyNotifications(user.userId, filterDto);
  }

  @Get('notifications/statistics')
  @HttpCode(HttpStatus.OK)
  async getNotificationStatistics(@CurrentUser() user: any) {
    return this.notificationService.getNotificationStatistics(user.userId);
  }

  @Patch('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.userId);
  }

  @Delete('notifications/expired')
  @HttpCode(HttpStatus.OK)
  async deleteExpiredNotifications(@CurrentUser() user: any) {
    return this.notificationService.deleteExpiredNotifications(user.userId);
  }

  @Post('events/:eventId/announcements')
  @HttpCode(HttpStatus.CREATED)
  async sendGeneralAnnouncement(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
    @Body() announcementDto: SendAnnouncementDto,
  ) {
    return this.notificationService.sendGeneralAnnouncement(
      eventId,
      user.userId,
      announcementDto,
    );
  }

  @Get('notifications/:id')
  @HttpCode(HttpStatus.OK)
  async getNotificationDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.getNotificationDetails(id, user.userId);
  }

  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.markAsRead(id, user.userId);
  }

  @Delete('notifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.deleteNotification(id, user.userId);
  }
}
