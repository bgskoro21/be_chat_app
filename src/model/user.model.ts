export class RegisterUserRequest {
  username: string;
  password: string;
  name: string;
}

export class LoginUserRequest {
  username: string;
  password: string;
}

export class UserResponse {
  username?: string;
  name?: string;
  token?: string;
  refreshToken?: string;
  message?: string;
}
