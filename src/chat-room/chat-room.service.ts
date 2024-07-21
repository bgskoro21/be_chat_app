import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { ChatMessagesRequest, MessageRequest } from 'src/model/chat.model';
import { Logger } from 'winston';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async getChatRoomList(activeUserIds: number[]): Promise<any[]> {
    const rooms = await this.prismaService.chatRoom.findMany({
      where: {
        isActive: true,
        users: {
          some: {
            userId: {
              in: activeUserIds,
            },
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: true,
          },
        },
      },
    });

    // Sort rooms based on the timestamp of the latest message
    rooms.sort((roomA, roomB) => {
      if (roomA.messages.length === 0 && roomB.messages.length === 0) {
        return 0;
      } else if (roomA.messages.length === 0) {
        return 1; // roomA should come after roomB if roomA has no messages
      } else if (roomB.messages.length === 0) {
        return -1; // roomA should come before roomB if roomB has no messages
      } else {
        // Sort by the createdAt timestamp of the latest message
        return (
          new Date(roomB.messages[0].createdAt).getTime() -
          new Date(roomA.messages[0].createdAt).getTime()
        );
      }
    });

    const roomList = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      users: room.users.map((user) => ({
        id: user.userId,
        username: user.user.username,
        name: user.user.name,
      })),
      lastMessage:
        room.messages.length > 0
          ? {
              id: room.messages[0].id,
              content: room.messages[0].content,
              createdAt: room.messages[0].createdAt,
              sender: {
                id: room.messages[0].sender.Id,
                username: room.messages[0].sender.username,
                name: room.messages[0].sender.name,
                // tambahkan informasi pengguna lainnya sesuai kebutuhan
              },
            }
          : null,
    }));

    return roomList;
  }

  async getActiveChatRoom(chatRoomId: number): Promise<any> {
    const room = await this.prismaService.chatRoom.findFirst({
      where: {
        id: chatRoomId,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: true,
          },
        },
      },
    });

    return {
      id: room.id,
      name: room.name,
      users: room.users.map((user) => ({
        id: user.userId,
        username: user.user.username,
        name: user.user.name,
      })),
      lastMessage:
        room.messages.length > 0
          ? {
              id: room.messages[0].id,
              content: room.messages[0].content,
              createdAt: room.messages[0].createdAt,
              sender: {
                id: room.messages[0].sender.Id,
                username: room.messages[0].sender.username,
                name: room.messages[0].sender.name,
                // tambahkan informasi pengguna lainnya sesuai kebutuhan
              },
            }
          : null,
    };
  }

  async createChatRoom(request: ChatMessagesRequest) {
    try {
      let chatRoom = await this.prismaService.chatRoom.findFirst({
        where: {
          OR: [
            {
              name: `Chat between ${request.senderId} and ${request.receiverId}`,
            },
            {
              name: `Chat between ${request.receiverId} and ${request.senderId}`,
            },
          ],
        },
      });

      if (!chatRoom) {
        chatRoom = await this.prismaService.chatRoom.create({
          data: {
            name: `Chat between ${request.senderId} and ${request.receiverId}`,
          },
        });
      }

      // Pastikan UserChatRoom sudah ada untuk senderId
      let userChatRoomSender = await this.prismaService.userChatRoom.findFirst({
        where: {
          userId: request.senderId,
          chatRoomId: chatRoom.id,
        },
      });

      if (!userChatRoomSender) {
        await this.prismaService.userChatRoom.create({
          data: {
            userId: request.senderId,
            chatRoomId: chatRoom.id,
          },
        });
      }

      // Pastikan UserChatRoom sudah ada untuk receiverId
      let userChatRoomReceiver =
        await this.prismaService.userChatRoom.findFirst({
          where: {
            userId: request.receiverId,
            chatRoomId: chatRoom.id,
          },
        });

      if (!userChatRoomReceiver) {
        await this.prismaService.userChatRoom.create({
          data: {
            userId: request.receiverId,
            chatRoomId: chatRoom.id,
          },
        });
      }

      return chatRoom;
    } catch (e) {
      this.logger.info(`Error: ${e}`);
    }
  }

  async createChatMessage(request: MessageRequest) {
    try {
      const chatRoom = await this.prismaService.chatRoom.findFirst({
        where: {
          id: request.chatRoomId,
        },
      });

      if (!chatRoom.isActive) {
        await this.prismaService.chatRoom.update({
          where: {
            id: request.chatRoomId,
          },
          data: {
            isActive: true,
          },
        });
      }
      // Now handle the message and broadcast it to clients
      const savedMessage = await this.prismaService.message.create({
        data: {
          content: request.content,
          senderId: request.senderId,
          chatRoomId: request.chatRoomId,
        },
        include: {
          sender: true, // Include sender details
          chatRoom: true, // Include chat room details
        },
      });

      return savedMessage;
    } catch (error) {
      this.logger.info(`Error handling chat message: `, error);
    }
  }
}
