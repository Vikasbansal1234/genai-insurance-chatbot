import * as z from 'zod';
import { tool } from 'langchain';
import { PolicyService } from '../../domains/policy/policy.service';
import { AppModule } from '../../app.module';
import { NestFactory } from '@nestjs/core';

/**
 * Initialize NestJS and get the service instance once.
 */
let service: PolicyService;
const init = async () => {
  if (!service) {
    const app = await NestFactory.createApplicationContext(AppModule);
    service = app.get(PolicyService);
  }
  return service;
};

export const purchaseInsurance = tool(
  async (input: any, config) => {
    const svc = await init();
    const user_id = config.context.user_id;

    // Transform input to match PurchaseInsuranceDto
    const dto = {
      planName: input.planName,
      agentId: input.agentId,
      insured: input.insured,
      beneficiaries: input.beneficiaries || [],
      customerPhone: input.customerPhone,
    };

    return svc.purchaseInsurance(user_id, dto);
  },
  {
    name: 'purchase_insurance',
    description:
      "Purchase a new insurance policy for a customer. Creates customer record, policy, and payment. Requires a valid plan name (e.g., 'Basic Health Insurance', 'Premium Life Insurance'). Customer name and email are automatically taken from authenticated user. User is automatically identified from authentication context.",
    schema: z.object({
      planName: z
        .string()
        .describe(
          "The name of the insurance plan (e.g., 'Basic Health Insurance', 'Premium Life Insurance'). Use get_all_plans tool to see available plans.",
        ),
      agentId: z
        .string()
        .optional()
        .describe('Optional agent ID who is selling this policy (auto-assigned if not provided)'),
      insured: z.object({
        name: z.string().describe('Name of the person insured'),
        relation: z.string().describe('Relationship to customer (e.g., self, spouse, child)'),
        dob: z.string().describe('Date of birth in ISO format (YYYY-MM-DD)'),
      }),
      beneficiaries: z
        .array(
          z.object({
            name: z.string().describe('Beneficiary name'),
            relation: z.string().describe('Relationship to insured'),
          }),
        )
        .optional()
        .describe('List of beneficiaries who will receive benefits'),
      customerPhone: z.string().describe("Customer's phone number"),
    }),
  },
);

export const renewInsurance = tool(
  async (input: any, config) => {
    const svc = await init();
    const user_id = config.context.user_id;
    return svc.renewInsuranceByPolicyNumber(user_id, input.policyNumber);
  },
  {
    name: 'renew_insurance',
    description:
      "Renew an existing insurance policy using the policy number. Extends the policy's end date by one year, creates a renewal record, and generates a payment record for the renewal premium. User is automatically identified from authentication context.",
    schema: z.object({
      policyNumber: z
        .string()
        .describe('The policy number (e.g., POL-1731234567890-ABCD1234) of the policy to renew.'),
    }),
  },
);

/**
 * Tool: cancelInsurance
 * Cancels a user's insurance policy.
 */
export const cancelInsurance = tool(
  async (input: any, config) => {
    const svc = await init();
    const user_id = config.context.user_id;
    return svc.cancelInsuranceByPolicyNumber(user_id, input.policyNumber, input.reason);
  },
  {
    name: 'cancel_insurance',
    description:
      "Cancel an existing insurance policy using the policy number. Creates a cancellation request, updates policy status to 'cancelled', and processes the cancellation workflow. User is automatically identified from authentication context.",
    schema: z.object({
      policyNumber: z
        .string()
        .describe('The policy number (e.g., POL-1731234567890-ABCD1234) of the policy to cancel.'),
      reason: z
        .string()
        .optional()
        .describe(
          "Optional reason for cancellation (e.g., 'Customer requested', 'Found better plan')",
        ),
    }),
  },
);

/**
 * Tool: getInsurance
 * Retrieves all insurance policies for the current user.
 */
export const getInsurance = tool(
  async (input: any, config) => {
    const svc = await init();
    const user_id = config.context.user_id;
    return svc.getInsurance(user_id);
  },
  {
    name: 'get_insurance',
    description:
      'Fetch all insurance policies for the authenticated user. Returns policies with populated customer, plan, and agent details. Use when user asks about their insurance policies. User is automatically identified from authentication context.',
    schema: z.object({}), // No input needed - user comes from context
  },
);

/**
 * Tool: getInsuranceById
 * Fetch detailed information for a specific insurance policy using the policy ID.
 */
export const getInsuranceById = tool(
  async (input: any, config) => {
    const svc = await init();
    const user_id = config.context.user_id;
    return svc.getInsuranceByPolicyNumber(user_id, input.policyNumber);
  },
  {
    name: 'get_insurance_by_policy_number',
    description:
      'Retrieve comprehensive details about a specific insurance policy using its policy number. Returns complete policy history including all related payments, renewals, and cancellation requests. Use when user asks for details about a specific policy by its number. User is automatically identified from authentication context.',
    schema: z.object({
      policyNumber: z.string().describe('The policy number of the insurance policy.'),
    }),
  },
);
