import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatMessagesRequest } from 'src/model/chat.model';
import { WebResponse } from 'src/model/web.model';
import { UserResponse } from 'src/model/user.model';

@Controller('/api/chat')
export class ChatController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @HttpCode(201)
  async createChatRoom(
    @Body() request: ChatMessagesRequest,
  ): Promise<WebResponse<UserResponse>> {
    console.log(`userId: ${request.senderId}`);
    const result = await this.chatRoomService.createChatRoom(request);

    return {
      data: result,
    };
  }
}
