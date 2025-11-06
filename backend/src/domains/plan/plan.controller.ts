import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('plans')
@Controller('plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /**
   * GET /api/plans
   * Get all available insurance plans
   */
  @Get()
  @ApiOperation({
    summary: 'Get all insurance plans',
    description:
      'Retrieve all available insurance plans in the system. Returns plan details including code, name, category, premium, and coverage information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    schema: {
      example: {
        success: true,
        count: 3,
        data: [
          {
            _id: '65f1234567890abcdef12345',
            code: 'HEALTH-BASIC',
            name: 'Basic Health Insurance',
            category: 'health',
            basePremium: 5000,
            coverage: {
              sumInsured: 500000,
              riders: ['Hospitalization', 'OPD'],
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  getAllPlans() {
    return this.planService.getAllPlans();
  }

  /**
   * GET /api/plans/:id
   * Get specific plan by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get plan by ID',
    description:
      'Retrieve detailed information about a specific insurance plan by its MongoDB ObjectId.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan MongoDB ObjectId',
    type: String,
    example: '65f1234567890abcdef12345',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          _id: '65f1234567890abcdef12345',
          code: 'HEALTH-BASIC',
          name: 'Basic Health Insurance',
          category: 'health',
          basePremium: 5000,
          coverage: {
            sumInsured: 500000,
            riders: ['Hospitalization', 'OPD'],
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  getPlanById(@Param('id') id: string) {
    return this.planService.getPlanById(id);
  }

  /**
   * GET /api/plans/category/:category
   * Get plans by category
   */
  @Get('category/:category')
  @ApiOperation({
    summary: 'Get plans by category',
    description: 'Retrieve all insurance plans in a specific category (health, life, motor, home).',
  })
  @ApiParam({
    name: 'category',
    description: 'Plan category',
    enum: ['health', 'life', 'motor', 'home'],
    type: String,
    example: 'health',
  })
  @ApiResponse({
    status: 200,
    description: 'Plans retrieved successfully',
    schema: {
      example: {
        success: true,
        count: 2,
        category: 'health',
        data: [
          {
            _id: '65f1234567890abcdef12345',
            code: 'HEALTH-BASIC',
            name: 'Basic Health Insurance',
            category: 'health',
            basePremium: 5000,
            coverage: {
              sumInsured: 500000,
              riders: ['Hospitalization', 'OPD'],
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'No plans found in this category' })
  getPlansByCategory(@Param('category') category: string) {
    return this.planService.getPlansByCategory(category);
  }
}
