import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CommonModule } from 'src/common/common.module';
import { ChatController } from './chat-room.controller';

@Module({
  imports: [CommonModule],
  providers: [ChatRoomService],
  exports: [ChatRoomService],
  controllers: [ChatController],
})
export class ChatRoomModule {}
