import { Module } from '@nestjs/common';
import { AuthMiddleware } from './auth.middleware';
import { WsAuthMiddleware } from './ws-auth.middleware';
import { RefreshTokenMiddleware } from './refresh-token.middleware';

@Module({
  providers: [AuthMiddleware, WsAuthMiddleware, RefreshTokenMiddleware],
  exports: [AuthMiddleware, WsAuthMiddleware, RefreshTokenMiddleware],
})
export class MiddlewareModule {}
