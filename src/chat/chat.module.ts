import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ChatGateway, MessageService, PrismaService],
})
export class ChatModule {}
