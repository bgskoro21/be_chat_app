import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { PrismaService } from 'src/common/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}

  async use(req: any, res: Response, next: NextFunction) {
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
      throw new HttpException('Refresh token is missing', 401);
    }

    const isInvalidToken =
      await this.prismaService.personalAccessToken.findFirst({
        where: {
          AND: [{ token: refreshToken }, { status: 'Invalid' }],
        },
      });

    if (isInvalidToken) {
      throw new HttpException('Invalid refresh token!', 401);
    }

    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      req.user = payload;
      await this.prismaService.personalAccessToken.update({
        where: {
          token: refreshToken,
        },
        data: {
          status: 'Invalid',
        },
      });
      next();
    } catch (error) {
      console.log(`${error.name}`);
      if (error.name === 'TokenExpiredError') {
        await this.prismaService.personalAccessToken.update({
          where: {
            token: refreshToken,
          },
          data: {
            status: 'Expired',
          },
        });
        throw new HttpException('Refresh token expired!', 401);
      } else {
        await this.prismaService.personalAccessToken.update({
          where: {
            token: refreshToken,
          },
          data: {
            status: 'Invalid',
          },
        });
        throw new HttpException('Invalid refresh token!', 401);
      }
    }
  }
}
