import * as z from 'zod';
import { tool } from 'langchain';
import { PlanService } from '../../domains/plan/plan.service';
import { AppModule } from '../../app.module';
import { NestFactory } from '@nestjs/core';

/**
 * Initialize NestJS and get the PlanService instance once.
 */
let planService: PlanService;
const initPlanService = async () => {
  if (!planService) {
    const app = await NestFactory.createApplicationContext(AppModule);
    planService = app.get(PlanService);
  }
  return planService;
};

/**
 * Tool: getAllPlans
 * Retrieves all available insurance plans
 */
export const getAllPlans = tool(
  async (_input: any, _config) => {
    const svc = await initPlanService();
    return svc.getAllPlans();
  },
  {
    name: 'get_all_plans',
    description:
      'Retrieve all available insurance plans in the system. Returns complete list of plans with details including plan name, category (health/life/motor/home), base premium, coverage amount, and available riders. Use this when user asks about available insurance plans or wants to compare different plans.',
    schema: z.object({}), // No input needed
  },
);

/**
 * Tool: getPlanById
 * Retrieves detailed information about a specific plan
 */
export const getPlanById = tool(
  async (input: any, _config) => {
    const svc = await initPlanService();
    return svc.getPlanById(input.planId);
  },
  {
    name: 'get_plan_by_id',
    description:
      'Retrieve detailed information about a specific insurance plan using its ID. Returns plan name, category, base premium, coverage details, and available riders. Use when user asks about a specific plan or needs details before purchasing.',
    schema: z.object({
      planId: z.string().describe('The MongoDB ObjectId of the insurance plan'),
    }),
  },
);

/**
 * Tool: getPlansByCategory
 * Retrieves all plans in a specific category
 */
export const getPlansByCategory = tool(
  async (input: any, _config) => {
    const svc = await initPlanService();
    return svc.getPlansByCategory(input.category);
  },
  {
    name: 'get_plans_by_category',
    description:
      "Retrieve all insurance plans in a specific category (health, life, motor, or home). Returns filtered list of plans with all details. Use when user asks for plans in a specific category like 'show me health insurance plans' or 'what life insurance do you offer'.",
    schema: z.object({
      category: z
        .enum(['health', 'life', 'motor', 'home'])
        .describe('The category of insurance plans to retrieve (health, life, motor, or home)'),
    }),
  },
);
