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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { EventService } from './event.service';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @CurrentUser() user: any,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.createEvent(user.userId, createEventDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyEvents(@CurrentUser() user: any) {
    return this.eventService.getMyEvents(user.userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.getEventDetails(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(id, user.userId, updateEventDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateEventStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    return this.eventService.updateEventStatus(id, user.userId, updateEventStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.eventService.deleteEvent(id, user.userId);
  }
}
