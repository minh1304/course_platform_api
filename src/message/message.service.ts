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
async getInboxUsers(userId: string): Promise<{ userId: string; userName: string }[]> {
  // Step 1: Get all messages involving the user
  const messages = await this.prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    select: {
      senderId: true,
      receiverId: true,
    },
  });

  // Step 2: Extract the other users' IDs
  const userSet = new Set<string>();
  for (const message of messages) {
    if (message.senderId !== userId) {
      userSet.add(message.senderId);
    }
    if (message.receiverId !== userId) {
      userSet.add(message.receiverId);
    }
  }

  const userIds = Array.from(userSet);

  // Step 3: Fetch user names
  const users = await this.prisma.appUser.findMany({
    where: {
      userId: { in: userIds },
    },
    select: {
      userId: true,
      fullName: true,
    },
  });

  // Step 4: Map to expected format
  return users.map((user) => ({
    userId: user.userId,
    userName: user.fullName ?? "Unknown",
  }));
}
}
