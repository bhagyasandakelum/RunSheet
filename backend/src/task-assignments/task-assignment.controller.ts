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
import { AssignMemberDto } from './dto/assign-member.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { TaskAssignmentService } from './task-assignment.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TaskAssignmentController {
  constructor(private readonly taskAssignmentService: TaskAssignmentService) {}

  @Post('tasks/:taskId/assignments')
  @HttpCode(HttpStatus.CREATED)
  async assignMemberToTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
    @Body() assignDto: AssignMemberDto,
  ) {
    return this.taskAssignmentService.assignMemberToTask(
      taskId,
      user.userId,
      assignDto,
    );
  }

  @Get('tasks/:taskId/assignments')
  @HttpCode(HttpStatus.OK)
  async getTaskAssignments(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskAssignmentService.getTaskAssignments(taskId, user.userId);
  }

  @Get('task-assignments/my')
  @HttpCode(HttpStatus.OK)
  async getMyAssignedTasks(@CurrentUser() user: any) {
    return this.taskAssignmentService.getMyAssignedTasks(user.userId);
  }

  @Get('task-assignments/:id')
  @HttpCode(HttpStatus.OK)
  async getAssignmentDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.taskAssignmentService.getAssignmentDetails(id, user.userId);
  }

  @Patch('task-assignments/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateAssignmentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateAssignmentStatusDto,
  ) {
    return this.taskAssignmentService.updateAssignmentStatus(
      id,
      user.userId,
      updateDto,
    );
  }

  @Delete('task-assignments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.taskAssignmentService.removeAssignment(id, user.userId);
  }

  @Get('team-memberships/:teamMembershipId/assignments')
  @HttpCode(HttpStatus.OK)
  async getAssignmentsByMember(
    @Param('teamMembershipId', ParseUUIDPipe) teamMembershipId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskAssignmentService.getAssignmentsByMember(
      teamMembershipId,
      user.userId,
    );
  }

  @Get('events/:eventId/assignment-statistics')
  @HttpCode(HttpStatus.OK)
  async getAssignmentStatistics(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.taskAssignmentService.getAssignmentStatistics(
      eventId,
      user.userId,
    );
  }
}
