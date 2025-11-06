import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import request from 'supertest';
import { ChatController } from '../../../src/domains/chat/chat.controller';
import { ChatService } from '../../../src/domains/chat/chat.service';
import { JwtAuthGuard } from '../../../src/domains/shared/guards/jwt-auth.guard';
import { CreateChatDto } from '../../../src/domains/chat/dto/create-chat.dto';
import { UpdateChatDto } from '../../../src/domains/chat/dto/update-chat.dto';

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let _chatService: ChatService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockChat = {
    _id: '507f1f77bcf86cd799439012',
    userId: mockUser.id,
    title: 'Test Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockChats = [mockChat];

  const mockChatService = {
    createChat: jest.fn(),
    getUserChats: jest.fn(),
    getChatById: jest.fn(),
    updateChatTitle: jest.fn(),
    deleteChat: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
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

    _chatService = moduleFixture.get<ChatService>(ChatService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should create a new chat with title', async () => {
      const createDto: CreateChatDto = { title: 'New Chat' };
      mockChatService.createChat.mockResolvedValue(mockChat);

      const response = await request(app.getHttpServer())
        .post('/api/chat')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockChat);
      expect(mockChatService.createChat).toHaveBeenCalledWith(expect.any(String), createDto.title);
    });

    it('should create a new chat without title', async () => {
      const createDto: CreateChatDto = {};
      mockChatService.createChat.mockResolvedValue(mockChat);

      const response = await request(app.getHttpServer())
        .post('/api/chat')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockChat);
      expect(mockChatService.createChat).toHaveBeenCalledWith(expect.any(String), undefined);
    });

    it('should return 400 when title is not a string', async () => {
      const invalidDto = { title: 123 };

      await request(app.getHttpServer())
        .post('/api/chat')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(invalidDto)
        .expect(400);

      expect(mockChatService.createChat).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/chat', () => {
    it('should get all user chats', async () => {
      mockChatService.getUserChats.mockResolvedValue(mockChats);

      const response = await request(app.getHttpServer())
        .get('/api/chat')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toEqual(mockChats);
      expect(mockChatService.getUserChats).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return empty array when user has no chats', async () => {
      mockChatService.getUserChats.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/chat')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/chat/:id', () => {
    it('should get chat by id', async () => {
      mockChatService.getChatById.mockResolvedValue(mockChat);

      const response = await request(app.getHttpServer())
        .get(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toEqual(mockChat);
      expect(mockChatService.getChatById).toHaveBeenCalledWith(mockChat._id, expect.any(String));
    });

    it('should return 404 when chat not found', async () => {
      mockChatService.getChatById.mockRejectedValue(
        new NotFoundException('Chat with ID invalid-id not found'),
      );

      await request(app.getHttpServer())
        .get('/api/chat/invalid-id')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);
    });

    it('should return 403 when user does not own chat', async () => {
      mockChatService.getChatById.mockRejectedValue(
        new ForbiddenException('You do not have access to this chat'),
      );

      await request(app.getHttpServer())
        .get(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(403);
    });
  });

  describe('PATCH /api/chat/:id', () => {
    it('should update chat title', async () => {
      const updateDto: UpdateChatDto = { title: 'Updated Title' };
      const updatedChat = { ...mockChat, title: updateDto.title };
      mockChatService.updateChatTitle.mockResolvedValue(updatedChat);

      const response = await request(app.getHttpServer())
        .patch(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(mockChatService.updateChatTitle).toHaveBeenCalledWith(
        mockChat._id,
        expect.any(String),
        updateDto.title,
      );
    });

    it('should return 400 when title is missing', async () => {
      const invalidDto = {};

      await request(app.getHttpServer())
        .patch(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(invalidDto)
        .expect(400);

      expect(mockChatService.updateChatTitle).not.toHaveBeenCalled();
    });

    it('should return 400 when title is not a string', async () => {
      const invalidDto = { title: 123 };

      await request(app.getHttpServer())
        .patch(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(invalidDto)
        .expect(400);

      expect(mockChatService.updateChatTitle).not.toHaveBeenCalled();
    });

    it('should return 404 when chat not found', async () => {
      const updateDto: UpdateChatDto = { title: 'New Title' };
      mockChatService.updateChatTitle.mockRejectedValue(
        new NotFoundException('Chat with ID invalid-id not found'),
      );

      await request(app.getHttpServer())
        .patch('/api/chat/invalid-id')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateDto)
        .expect(404);
    });

    it('should return 403 when user does not own chat', async () => {
      const updateDto: UpdateChatDto = { title: 'New Title' };
      mockChatService.updateChatTitle.mockRejectedValue(
        new ForbiddenException('You do not have access to this chat'),
      );

      await request(app.getHttpServer())
        .patch(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(updateDto)
        .expect(403);
    });
  });

  describe('DELETE /api/chat/:id', () => {
    it('should delete chat successfully', async () => {
      mockChatService.deleteChat.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toEqual({ message: 'Chat deleted successfully' });
      expect(mockChatService.deleteChat).toHaveBeenCalledWith(mockChat._id, expect.any(String));
    });

    it('should return 404 when chat not found', async () => {
      mockChatService.deleteChat.mockRejectedValue(
        new NotFoundException('Chat with ID invalid-id not found'),
      );

      await request(app.getHttpServer())
        .delete('/api/chat/invalid-id')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);
    });

    it('should return 403 when user does not own chat', async () => {
      mockChatService.deleteChat.mockRejectedValue(
        new ForbiddenException('You do not have access to this chat'),
      );

      await request(app.getHttpServer())
        .delete(`/api/chat/${mockChat._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(403);
    });
  });
});
