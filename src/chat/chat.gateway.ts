import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
@WebSocketGateway(3002, {})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect     {
  handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: any) {
      console.log(`Client disconnected: ${client.id}`);
  }
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
//   handleEvent(client: Socket, data: string) {
//     client.emit('events', data);
//     this.server.emit("events", 'broadcasting...', data);
//   }
  handleMessage(@MessageBody() message: { sender: string; content: string }) {
    // Broadcast to all clients
    this.server.emit('receiveMessage', message);
  }
}   