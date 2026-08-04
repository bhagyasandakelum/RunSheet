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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('teams/:teamId/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.createTask(teamId, user.userId, createTaskDto);
  }

  @Get('teams/:teamId/tasks')
  @HttpCode(HttpStatus.OK)
  async getTeamTasks(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser() user: any,
    @Query() filterDto: TaskFilterDto,
  ) {
    return this.taskService.getTeamTasks(teamId, user.userId, filterDto);
  }

  @Get('events/:eventId/tasks')
  @HttpCode(HttpStatus.OK)
  async getEventTasks(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskService.getEventTasks(eventId, user.userId);
  }

  @Get('tasks/search')
  @HttpCode(HttpStatus.OK)
  async searchTasks(
    @CurrentUser() user: any,
    @Query() filterDto: TaskFilterDto,
  ) {
    return this.taskService.searchTasks(user.userId, filterDto);
  }

  @Get('tasks/my-team')
  @HttpCode(HttpStatus.OK)
  async getMyTeamTasks(
    @CurrentUser() user: any,
    @Query('eventId') eventId?: string,
  ) {
    return this.taskService.getMyTeamTasks(user.userId, eventId);
  }

  @Get('events/:eventId/task-statistics')
  @HttpCode(HttpStatus.OK)
  async getTaskStatistics(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskService.getTaskStatistics(eventId, user.userId);
  }

  @Get('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async getTaskDetails(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskService.getTaskDetails(taskId, user.userId);
  }

  @Patch('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(taskId, user.userId, updateTaskDto);
  }

  @Patch('tasks/:taskId/status')
  @HttpCode(HttpStatus.OK)
  async updateTaskStatus(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
    @Body() updateStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(taskId, user.userId, updateStatusDto);
  }

  @Delete('tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskService.deleteTask(taskId, user.userId);
  }
}
