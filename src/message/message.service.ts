import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(from: string, to: string, content: string) {
    return this.prisma.message.create({
      data: {
        senderId: from,
        receiverId: to,
        content,
      },
    });
  }

  async getMessageHistory(user1: string, user2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
