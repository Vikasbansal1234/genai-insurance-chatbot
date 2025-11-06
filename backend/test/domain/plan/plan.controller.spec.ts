import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { PlanController } from '../../../src/domains/plan/plan.controller';
import { PlanService } from '../../../src/domains/plan/plan.service';
import { JwtAuthGuard } from '../../../src/domains/shared/guards/jwt-auth.guard';

describe('PlanController (e2e)', () => {
  let app: INestApplication;
  let _planService: PlanService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'Test User',
  };

  const mockPlan = {
    _id: '507f1f77bcf86cd799439013',
    code: 'HEALTH-BASIC',
    name: 'Basic Health Insurance',
    category: 'health',
    basePremium: 5000,
    coverage: {
      sumInsured: 500000,
      riders: ['Hospitalization', 'OPD'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPlans = [mockPlan];

  const mockPlanService = {
    getAllPlans: jest.fn(),
    getPlanById: jest.fn(),
    getPlansByCategory: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        {
          provide: PlanService,
          useValue: mockPlanService,
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

    _planService = moduleFixture.get<PlanService>(PlanService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('should get all plans successfully', async () => {
      mockPlanService.getAllPlans.mockResolvedValue({
        success: true,
        count: 1,
        data: mockPlans,
      });

      const response = await request(app.getHttpServer())
        .get('/api/plans')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPlans);
      expect(mockPlanService.getAllPlans).toHaveBeenCalled();
    });

    it('should return empty array when no plans exist', async () => {
      mockPlanService.getAllPlans.mockResolvedValue({
        success: true,
        count: 0,
        data: [],
      });

      const response = await request(app.getHttpServer())
        .get('/api/plans')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/plans/:id', () => {
    it('should get plan by id successfully', async () => {
      mockPlanService.getPlanById.mockResolvedValue({
        success: true,
        data: mockPlan,
      });

      const response = await request(app.getHttpServer())
        .get(`/api/plans/${mockPlan._id}`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPlan);
      expect(mockPlanService.getPlanById).toHaveBeenCalledWith(mockPlan._id);
    });

    it('should return 404 when plan not found', async () => {
      mockPlanService.getPlanById.mockRejectedValue(new NotFoundException('Plan not found'));

      await request(app.getHttpServer())
        .get('/api/plans/invalid-id')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);

      expect(mockPlanService.getPlanById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('GET /api/plans/category/:category', () => {
    it('should get plans by category successfully', async () => {
      mockPlanService.getPlansByCategory.mockResolvedValue({
        success: true,
        count: 1,
        category: 'health',
        data: mockPlans,
      });

      const response = await request(app.getHttpServer())
        .get('/api/plans/category/health')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('health');
      expect(response.body.data).toEqual(mockPlans);
      expect(mockPlanService.getPlansByCategory).toHaveBeenCalledWith('health');
    });

    it('should return 404 when no plans found in category', async () => {
      mockPlanService.getPlansByCategory.mockRejectedValue(
        new NotFoundException('No plans found in this category'),
      );

      await request(app.getHttpServer())
        .get('/api/plans/category/invalid-category')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);

      expect(mockPlanService.getPlansByCategory).toHaveBeenCalledWith('invalid-category');
    });

    it('should handle different categories', async () => {
      const categories = ['health', 'life', 'motor', 'home'];

      for (const category of categories) {
        mockPlanService.getPlansByCategory.mockResolvedValue({
          success: true,
          count: 0,
          category,
          data: [],
        });

        const response = await request(app.getHttpServer())
          .get(`/api/plans/category/${category}`)
          .set('Authorization', 'Bearer mock-jwt-token')
          .expect(200);

        expect(response.body.category).toBe(category);
      }
    });
  });
});
