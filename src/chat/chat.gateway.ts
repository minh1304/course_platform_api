// chat.gateway.ts
import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

interface ConnectedUser {
  userId: string;
  userName: string;
  socketId: string;
}

@Injectable()
@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUser[] = [];

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const userName = client.handshake.query.userName as string;
    console.log(
      `User connected: ${userId} with socket ${client.id} and Name is: ${userName}`,
    );
    if (userId) {
      this.connectedUsers = this.connectedUsers.filter(
        (u) => u.userId !== userId,
      ); // optional deduplication
      this.connectedUsers.push({ userId, userName, socketId: client.id });
      this.broadcastOnlineUsers();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.socketId !== client.id,
    );
    this.broadcastOnlineUsers();
  }

  broadcastOnlineUsers() {
    this.server.emit(
      'onlineUsers',
      this.connectedUsers.map((u) => ({
        userId: u.userId,
        userName: u.userName,
      })),
    );
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { to: string; from: string; content: string },
  ) {
    // Save to DB
    const dataUpdated = await this.messageService.sendMessage(
      data.from,
      data.to,
      data.content,
    );

    const receiver = this.connectedUsers.find((u) => u.userId === data.to);
    if (receiver) {
      this.server.to(receiver.socketId).emit('receiveMessage', dataUpdated);
    }
  }

  @SubscribeMessage('getMessageHistory')
  async handleGetHistory(
    @MessageBody() data: { user1: string; user2: string },
    @ConnectedSocket() client: Socket,
  ) {
    const history = await this.messageService.getMessageHistory(
      data.user1,
      data.user2,
    );
    client.emit('messageHistory', history);
  }
}
