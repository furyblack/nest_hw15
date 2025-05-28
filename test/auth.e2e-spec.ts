import { INestApplication } from '@nestjs/common';
import { AuthTestManager } from './helpers/auth-test-manager';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'access-token-secret',
          signOptions: { expiresIn: '2s' },
        }),
      );
    });

    app = result.app;
    authTestManager = result.authTestManager;
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });
  // it('should registir new user', async () => {
  //   const res = await request(app).post('/api/v1/users/register').send({
  //     name: 'Test User',
  //     email: 'test@example.com',
  //     password: 'password123',
  //   });
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.status).toBe('success');
  //   expect(res.body.token).toBeDefined();
  //   expect(res.body.data.user).toBeDefined();
  //   expect(res.body.data.user.email).toBe('test@example.com');
  // });
  it('should register a new user', async () => {
    const registerData = {
      login: 'mihf',
      email: 'test@example.com',
      password: 'Test1234!',
    };

    const response = await authTestManager.registerUser(registerData);

    expect(response).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
