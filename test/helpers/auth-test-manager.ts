import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/moduls/user-accounts/dto/create-user.dto';

import request from 'supertest';
import { UserViewDto } from '../../src/moduls/user-accounts/api/view-dto/user.view-dto';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    // private readonly userTestManager: UsersTestManager,
  ) {}

  async registerUser(
    registerModel: CreateUserDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(registerModel)
      .expect(statusCode);
    return response.body;
  }
}
