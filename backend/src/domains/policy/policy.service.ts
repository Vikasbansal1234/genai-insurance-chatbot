import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerRepository } from '../customer/repositories/customer.repository';
import { PolicyRepository } from './repositories/policy.repository';
import { PlanRepository } from '../plan/repositories/plan.repository';
import { PaymentRepository } from '../payment/repositories/payment.repository';
import { RenewalRepository } from '../renewal/repositories/renewal.repository';
import { CancellationRequestRepository } from '../cancellation/repositories/cancellation-request.repository';
import { AgentRepository } from '../agent/repositories/agent.repository';
import { PurchaseInsuranceDto } from './dto/purchase-insurance.dto';
import { User, UserDocument } from '../auth/models/user.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly customerRepo: CustomerRepository,
    private readonly policyRepo: PolicyRepository,
    private readonly planRepo: PlanRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly renewalRepo: RenewalRepository,
    private readonly cancellationRepo: CancellationRequestRepository,
    private readonly agentRepo: AgentRepository,
  ) {}

  /**
   * Purchase Insurance - Creates customer, policy, and payment record
   */
  async purchaseInsurance(userId: string, dto: PurchaseInsuranceDto) {
    try {
      // 1. Get authenticated user's info
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException({ success: false, error: 'User not found' });
      }

      // Use authenticated user's email and username if not provided in DTO
      const customerEmail = dto.customerEmail || user.email;
      const customerName = dto.customerName || user.username;

      // 2. Find or create customer
      let customer = await this.customerRepo.findByEmail(customerEmail);
      if (!customer) {
        customer = await this.customerRepo.create({
          name: customerName,
          email: customerEmail,
          phone: dto.customerPhone,
        });
      }

      // 3. Validate plan exists by name
      const plan = await this.planRepo.findByName(dto.planName);
      if (!plan) {
        throw new NotFoundException({
          success: false,
          error: 'Plan not found',
          message: `No plan found with name: ${dto.planName}`,
        });
      }

      // 4. Get agent (use provided agentId or fetch first active agent)
      let agentId: any = undefined;
      if (dto.agentId) {
        const agent = await this.agentRepo.findById(dto.agentId);
        if (!agent) {
          throw new NotFoundException({ success: false, error: 'Agent not found' });
        }
        agentId = new Types.ObjectId(dto.agentId);
      } else {
        // Fetch first active agent as default
        const defaultAgent = await this.agentRepo.findFirstActive();
        if (defaultAgent) {
          agentId = defaultAgent._id as any;
        }
      }

      // 5. Generate policy number
      const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // 6. Create policy with active status
      const policy = await this.policyRepo.create({
        policyNumber,
        status: 'active', // Set to active immediately upon purchase
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        premium: plan.basePremium,
        insured: dto.insured,
        beneficiaries: dto.beneficiaries || [],
        customerId: customer._id as any,
        planId: plan._id as any,
        agentId: agentId,
      });

      // 7. Create payment record with completed status
      const payment = await this.paymentRepo.create({
        policyId: policy._id as any,
        type: 'purchase',
        amount: plan.basePremium,
        status: 'success', // Mark payment as completed
      });

      return {
        success: true,
        message: 'Insurance purchased successfully',
        data: {
          id: policy._id.toString(),
          policyNumber: policy.policyNumber,
          customer: customer,
          plan: plan,
          policy: policy,
          payment: payment,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to purchase insurance',
        message: error.message,
      });
    }
  }

  /**
   * Renew Insurance by Policy Number - Creates renewal record and updates policy
   */
  async renewInsuranceByPolicyNumber(userId: string, policyNumber: string) {
    try {
      const policy = await this.policyRepo.findByPolicyNumber(policyNumber);
      if (!policy) {
        throw new NotFoundException({
          success: false,
          error: 'Policy not found',
          message: `No policy found with policy number: ${policyNumber}`,
        });
      }

      // Verify ownership: Check if policy belongs to the authenticated user
      await this.verifyPolicyOwnership(userId, policy);

      const previousEnd = policy.endDate;
      const newEnd = new Date(previousEnd);
      newEnd.setFullYear(newEnd.getFullYear() + 1);

      // Create renewal record
      const renewal = await this.renewalRepo.create({
        policyId: policy._id as any,
        previousEnd,
        newEnd,
        status: 'requested',
      });

      // Update policy
      await this.policyRepo.update(policy._id.toString(), {
        endDate: newEnd,
        status: 'active',
      });

      // Create payment for renewal
      const payment = await this.paymentRepo.create({
        policyId: policy._id as any,
        type: 'renewal',
        amount: policy.premium,
        status: 'pending',
      });

      // Update renewal status
      await this.renewalRepo.updateStatus(renewal._id.toString(), 'completed');

      return {
        success: true,
        message: 'Insurance renewed successfully',
        data: {
          policy: await this.policyRepo.findById(policy._id.toString()),
          renewal,
          payment,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to renew insurance',
        message: error.message,
      });
    }
  }

  /**
   * Cancel Insurance by Policy Number - Creates cancellation request
   */
  async cancelInsuranceByPolicyNumber(
    userId: string,
    policyNumber: string,
    reason: string = 'User requested',
  ) {
    try {
      const policy = await this.policyRepo.findByPolicyNumber(policyNumber);
      if (!policy) {
        throw new NotFoundException({
          success: false,
          error: 'Policy not found',
          message: `No policy found with policy number: ${policyNumber}`,
        });
      }

      // Verify ownership: Check if policy belongs to the authenticated user
      await this.verifyPolicyOwnership(userId, policy);

      // Create cancellation request
      const cancellationRequest = await this.cancellationRepo.create({
        policyId: policy._id as any,
        reason,
        status: 'requested',
        requestedAt: new Date(),
      });

      // Update policy status
      await this.policyRepo.updateStatus(policy._id.toString(), 'cancelled');

      // Approve cancellation immediately (in real app, this might need approval workflow)
      await this.cancellationRepo.updateStatus(
        cancellationRequest._id.toString(),
        'approved',
        new Date(),
      );

      return {
        success: true,
        message: 'Insurance cancelled successfully',
        data: {
          policy: await this.policyRepo.findById(policy._id.toString()),
          cancellationRequest,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to cancel insurance',
        message: error.message,
      });
    }
  }

  /**
   * Get all policies for a customer (mapped by userId)
   */
  async getInsurance(userId: string) {
    try {
      // 1. Get user by ID to get their email
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException({ success: false, error: 'User not found' });
      }

      // 2. Find customer by user's email
      const customer = await this.customerRepo.findByEmail(user.email);
      if (!customer) {
        // User has no policies yet (no customer record)
        return {
          success: true,
          count: 0,
          data: [],
        };
      }

      // 3. Get all policies for this customer
      const policies = await this.policyRepo.findByCustomerId(customer._id.toString());

      return {
        success: true,
        count: policies.length,
        data: policies,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch insurance policies',
        message: error.message,
      });
    }
  }

  /**
   * Get specific policy by Policy Number
   */
  async getInsuranceByPolicyNumber(userId: string, policyNumber: string) {
    try {
      const policy = await this.policyRepo.findByPolicyNumber(policyNumber);
      if (!policy) {
        throw new NotFoundException({
          success: false,
          error: 'Policy not found',
          message: `No policy found with policy number: ${policyNumber}`,
        });
      }

      // Verify ownership: Check if policy belongs to the authenticated user
      await this.verifyPolicyOwnership(userId, policy);

      // Get related data
      const policyId = policy._id.toString();
      const payments = await this.paymentRepo.findByPolicyId(policyId);
      const renewals = await this.renewalRepo.findByPolicyId(policyId);
      const cancellations = await this.cancellationRepo.findByPolicyId(policyId);

      return {
        success: true,
        data: {
          policy,
          payments,
          renewals,
          cancellations,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to fetch insurance policy',
        message: error.message,
      });
    }
  }

  /**
   * Helper method to verify if a policy belongs to the authenticated user
   */
  private async verifyPolicyOwnership(userId: string, policy: any): Promise<void> {
    // Get user by ID
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException({ success: false, error: 'User not found' });
    }

    // Get customer associated with the policy
    const customer = await this.customerRepo.findById(
      (policy.customerId as any)._id?.toString() || policy.customerId.toString(),
    );
    if (!customer) {
      throw new NotFoundException({ success: false, error: 'Customer not found' });
    }

    // Check if customer's email matches user's email
    if (customer.email !== user.email) {
      throw new ForbiddenException({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this policy',
      });
    }
  }
}
