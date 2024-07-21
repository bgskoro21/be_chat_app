import { HttpException, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from 'src/model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register new user ${JSON.stringify(request)}`);

    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername > 0) {
      throw new HttpException('Username already exists!', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`Login request from ${request.username}`);

    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findFirst({
      where: {
        username: request.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or password wrong!', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or password wrong!', 401);
    }

    const accessToken = await jwt.sign(
      { username: user.username, sub: user.Id },
      process.env.JWT_SECRET,
      { expiresIn: '1m' },
    );

    const refreshToken = await jwt.sign(
      { username: user.username, sub: user.Id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    await this.prismaService.personalAccessToken.createMany({
      data: [
        {
          token: accessToken,
          status: 'Active',
          type: 'AcessToken',
        },
        {
          token: refreshToken,
          status: 'Active',
          type: 'RefreshToken',
        },
      ],
    });

    return {
      username: user.username,
      name: user.name,
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  async search(keyword?: string): Promise<UserResponse[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: keyword
          ? {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            }
          : undefined,
        select: {
          Id: true,
          name: true,
          username: true,
        },
      });

      return users;
    } catch (e) {
      this.logger.info(`Error : ${e}`);
    }
  }

  async refreshToken(user: any): Promise<UserResponse> {
    this.logger.info(`refresh token from ${user.username}`);
    console.log(user);
    const newRefreshToken = await jwt.sign(
      { username: user.username, sub: user.sub },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );
    const accessToken = await jwt.sign(
      { username: user.username, sub: user.sub },
      process.env.JWT_SECRET,
      { expiresIn: '1m' },
    );

    await this.prismaService.personalAccessToken.createMany({
      data: [
        {
          token: accessToken,
          status: 'Active',
          type: 'AcessToken',
        },
        {
          token: newRefreshToken,
          status: 'Active',
          type: 'RefreshToken',
        },
      ],
    });

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(
    token: string,
    refreshToken: string,
    user: User,
  ): Promise<UserResponse> {
    this.logger.info(`Logout request from ${user.username}`);
    await this.prismaService.personalAccessToken.updateMany({
      where: {
        OR: [{ token: token }, { token: refreshToken }],
      },
      data: {
        status: 'Invalid',
      },
    });

    return {
      message: 'Logout Success!',
    };
  }
}
