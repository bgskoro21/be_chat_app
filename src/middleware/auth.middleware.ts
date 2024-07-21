import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/common/prisma.service';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prismaService: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(`token: ${token}`);

    if (!token) {
      throw new HttpException('Unauthorized!', 401);
    }

    const isInvalidToken =
      await this.prismaService.personalAccessToken.findFirst({
        where: {
          AND: [{ token: token }, { status: 'Invalid' }],
        },
      });

    if (isInvalidToken) {
      throw new HttpException('Token Invalid', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req['user'] = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        await this.prismaService.personalAccessToken.update({
          where: {
            token: token,
          },
          data: {
            status: 'Expired',
          },
        });
        throw new HttpException('Token expired!', 401);
      } else {
        await this.prismaService.personalAccessToken.update({
          where: {
            token: token,
          },
          data: {
            status: 'Invalid',
          },
        });
        throw new HttpException('Token invalid!', 401);
      }
    }
  }
}
