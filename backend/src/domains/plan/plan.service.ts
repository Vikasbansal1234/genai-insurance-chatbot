import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';

@Injectable()
export class PlanService {
  constructor(private readonly planRepo: PlanRepository) {}

  /**
   * Get all available insurance plans
   */
  async getAllPlans() {
    try {
      const plans = await this.planRepo.findAll();

      return {
        success: true,
        count: plans.length,
        data: plans,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch plans',
        message: error.message,
      });
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string) {
    try {
      const plan = await this.planRepo.findById(planId);

      if (!plan) {
        throw new NotFoundException({
          success: false,
          error: 'Plan not found',
          message: `No plan found with ID: ${planId}`,
        });
      }

      return {
        success: true,
        data: plan,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch plan',
        message: error.message,
      });
    }
  }

  /**
   * Get plans by category
   */
  async getPlansByCategory(category: string) {
    try {
      const plans = await this.planRepo.findByCategory(category);

      if (!plans || plans.length === 0) {
        throw new NotFoundException({
          success: false,
          error: 'No plans found',
          message: `No plans found in category: ${category}`,
        });
      }

      return {
        success: true,
        count: plans.length,
        category: category,
        data: plans,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch plans by category',
        message: error.message,
      });
    }
  }
}
