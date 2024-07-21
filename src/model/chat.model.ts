export class ChatMessagesRequest {
  senderId: number;
  receiverId: number;
}
export class MessageRequest {
  content: string;
  chatRoomId: number;
  senderId: number;
}
