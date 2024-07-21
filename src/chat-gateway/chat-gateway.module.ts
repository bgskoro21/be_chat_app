import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway.gateway';
import { MessagesModule } from 'src/messages/messages.module';
import { ChatRoomModule } from 'src/chat-room/chat-room.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [ChatRoomModule, MessagesModule, CommonModule],
  providers: [ChatGateway],
})
export class ChatGatewayModule {}
