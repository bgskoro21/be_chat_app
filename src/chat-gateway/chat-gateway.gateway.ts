import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { PrismaService } from 'src/common/prisma.service';
import { MessagesService } from 'src/messages/messages.service';
import { WsAuthMiddleware } from 'src/middleware/ws-auth.middleware';
import { ChatMessagesRequest, MessageRequest } from 'src/model/chat.model';

@WebSocketGateway({
  cors: {
    origin: '*', // Update with your client's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayConnection
{
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly MessageService: MessagesService,
    private readonly prismaServie: PrismaService,
  ) {}
  @WebSocketServer()
  server: Server;

  private users: number = 0;

  async afterInit(server: Server) {
    server.use((socket, next) =>
      new WsAuthMiddleware(this.prismaServie).use(socket, next),
    );
  }

  handleConnection(client: any, ...args: any[]) {
    this.users++;
    this.server.emit('users', this.users);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.users--;
    this.server.emit('users', this.users);
    console.log(`Client disconnected: ${client.id}`);
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Client Connected');
    });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    { activeUserIds }: { activeUserIds: number[] },
  ) {
    const roomList = await this.chatRoomService.getChatRoomList(activeUserIds);
    client.emit('roomList', roomList);
  }

  @SubscribeMessage('joinedRoom')
  async handleUserJoindedRoom(
    client: Socket,
    { chatRoomId }: { chatRoomId: number },
  ) {
    const messageByChatRoom =
      await this.MessageService.getMessagesByRoom(chatRoomId);
    client.emit('messageList', messageByChatRoom);
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: MessageRequest) {
    console.log(message);
    const savedMessage = await this.chatRoomService.createChatMessage({
      senderId: message.senderId,
      chatRoomId: message.chatRoomId,
      content: message.content,
    });
    this.server.emit('message', savedMessage);

    const room = await this.chatRoomService.getActiveChatRoom(
      message.chatRoomId,
    );

    this.server.emit('activeRoom', room);
  }
}
