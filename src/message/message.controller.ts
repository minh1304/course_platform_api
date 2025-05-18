// src/message/message.controller.ts
import { Controller, Get, UseGuards, Request, Query, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Only accessible by users with usertype === 'user'
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('user-messages')
  getUserMessages(@Request() req) {
    return `User ${req.user.username} messages`;
  }

  // Only accessible by users with usertype === 'teacher'
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('teacher-messages')
  getTeacherMessages(@Request() req) {
    return `Teacher ${req.user.username} messages`;
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-inbox-users')
  async getInboxUsers(@Body('userId') userId: string): Promise<{ userId: string; userName: string }[]> {
    return await this.messageService.getInboxUsers(userId);
  }
}
