import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';
import { MessagesModule } from './messages/messages.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { RefreshTokenMiddleware } from './middleware/refresh-token.middleware';

@Module({
  imports: [
    CommonModule,
    ChatGatewayModule,
    MessagesModule,
    UsersModule,
    SchedulerModule,
    ChatRoomModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/users/logout');
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'api/users',
      method: RequestMethod.GET,
    });
    consumer.apply(AuthMiddleware).forRoutes('api/chat');
    consumer.apply(RefreshTokenMiddleware).forRoutes('api/users/auth/refresh');
  }
}
