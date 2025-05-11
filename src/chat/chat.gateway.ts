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
  userName: string;
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
    const userName = client.handshake.query.userName as string;
    console.log(`User connected: ${userId} with socket ${client.id} and Name is: ${userName}`);
    if (userId) {
      this.connectedUsers = this.connectedUsers.filter(u => u.userId !== userId); // optional deduplication
      this.connectedUsers.push({ userId, userName, socketId: client.id });
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
    this.server.emit('onlineUsers', this.connectedUsers.map(u => ({
      userId: u.userId,
      userName: u.userName
    })));
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
