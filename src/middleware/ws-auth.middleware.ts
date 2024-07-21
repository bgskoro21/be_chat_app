import { Injectable, NestMiddleware } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/common/prisma.service';
// Sesuaikan dengan path Anda

@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}

  async use(socket: Socket, next: (err?: any) => void) {
    const token = socket.handshake.query.token as string;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket['user'] = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        await this.prismaService.personalAccessToken.updateMany({
          where: {
            token: token,
          },
          data: {
            status: 'Expired',
          },
        });
        return next(new Error('Token expired!'));
      } else {
        await this.prismaService.personalAccessToken.updateMany({
          where: {
            token: token,
          },
          data: {
            status: 'Invalid',
          },
        });
        return next(new Error('Invalid Token!'));
      }
    }
  }
}
