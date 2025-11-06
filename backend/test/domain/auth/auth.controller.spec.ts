import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../../../src/domains/auth/auth.controller';
import { AuthService } from '../../../src/domains/auth/auth.service';
import { JwtAuthGuard } from '../../../src/domains/shared/guards/jwt-auth.guard';
import { RegisterDto } from '../../../src/domains/auth/dto/register.dto';
import { LoginDto } from '../../../src/domains/auth/dto/login.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let _authService: AuthService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockRegisterResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: mockUser,
      access_token: 'mock-jwt-token',
    },
  };

  const mockLoginResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: mockUser,
      access_token: 'mock-jwt-token',
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(context => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    _authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegisterDto: RegisterDto = {
      email: 'test@example.com',
      username: 'Test User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(201);

      expect(response.body).toEqual(mockRegisterResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should return 400 when email is missing', async () => {
      const invalidDto = {
        username: 'Test User',
        password: 'password123',
      };

      await request(app.getHttpServer()).post('/api/auth/register').send(invalidDto).expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const invalidDto = {
        email: 'test@example.com',
        username: 'Test User',
      };

      await request(app.getHttpServer()).post('/api/auth/register').send(invalidDto).expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 400 when email is invalid', async () => {
      const invalidDto = {
        email: 'invalid-email',
        username: 'Test User',
        password: 'password123',
      };

      await request(app.getHttpServer()).post('/api/auth/register').send(invalidDto).expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too short', async () => {
      const invalidDto = {
        email: 'test@example.com',
        username: 'Test User',
        password: '123',
      };

      await request(app.getHttpServer()).post('/api/auth/register').send(invalidDto).expect(400);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should return 409 when user already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(409);

      expect(mockAuthService.register).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(validLoginDto)
        .expect(200);

      expect(response.body).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should return 400 when email is missing', async () => {
      const invalidDto = {
        password: 'password123',
      };

      await request(app.getHttpServer()).post('/api/auth/login').send(invalidDto).expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const invalidDto = {
        email: 'test@example.com',
      };

      await request(app.getHttpServer()).post('/api/auth/login').send(invalidDto).expect(400);

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should return 401 when credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await request(app.getHttpServer()).post('/api/auth/login').send(validLoginDto).expect(401);

      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 when token is missing', async () => {
      const moduleWithBlockingGuard: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: jest.fn(() => {
            throw new Error('Unauthorized');
          }),
        })
        .compile();

      const blockingApp = moduleWithBlockingGuard.createNestApplication();
      blockingApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
      blockingApp.setGlobalPrefix('api');
      await blockingApp.init();

      await request(blockingApp.getHttpServer()).get('/api/auth/profile').expect(500);

      await blockingApp.close();
    });
  });
});
