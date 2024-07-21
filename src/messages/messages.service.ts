import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMessagesByRoom(chatRoomId: number) {
    return this.prismaService.message.findMany({
      where: {
        chatRoomId: chatRoomId,
      },
      include: {
        sender: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
