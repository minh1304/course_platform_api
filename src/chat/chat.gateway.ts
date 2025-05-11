// chat.gateway.ts
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

interface ConnectedUser {
  userId: string;
  socketId: string;
}

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUser[] = [];

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`User connected: ${userId} with socket ${client.id}`);
    if (userId) {
      this.connectedUsers = this.connectedUsers.filter(u => u.userId !== userId); // optional deduplication
      this.connectedUsers.push({ userId, socketId: client.id });
      this.broadcastOnlineUsers();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.socketId !== client.id
    );
    this.broadcastOnlineUsers();
  }

  broadcastOnlineUsers() {
    this.server.emit('onlineUsers', this.connectedUsers.map(u => u.userId));
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { to: string; from: string; content: string }
  ) {
    const receiver = this.connectedUsers.find((u) => u.userId === data.to);
    if (receiver) {
      this.server.to(receiver.socketId).emit('receiveMessage', data);
    }
  }
}
