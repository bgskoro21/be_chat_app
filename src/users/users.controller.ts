import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './users.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from 'src/model/user.model';
import { WebResponse } from 'src/model/web.model';
import { Auth } from 'src/common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    console.log(request);
    const result = await this.userService.login(request);
    return {
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Query('keyword') keyword?: string,
  ): Promise<WebResponse<UserResponse[]>> {
    const result = await this.userService.search(keyword);
    return {
      data: result,
    };
  }

  @Post('/auth/refresh')
  @HttpCode(200)
  async refresh(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.refreshToken(user);
    return {
      data: result,
    };
  }

  @Post('/logout')
  @HttpCode(200)
  async logout(
    @Auth() user: User,
    @Req() req: any,
  ): Promise<WebResponse<UserResponse>> {
    const token = req.headers['authorization'].split(' ')[1];
    const result = await this.userService.logout(
      token,
      req.body.refreshToken,
      user,
    );
    return {
      data: result,
    };
  }
}
