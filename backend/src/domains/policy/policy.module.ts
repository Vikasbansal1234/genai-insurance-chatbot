import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
// Repository imports
import { CustomerRepository } from '../customer/repositories/customer.repository';
import { PolicyRepository } from './repositories/policy.repository';
import { PlanRepository } from '../plan/repositories/plan.repository';
import { PaymentRepository } from '../payment/repositories/payment.repository';
import { RenewalRepository } from '../renewal/repositories/renewal.repository';
import { CancellationRequestRepository } from '../cancellation/repositories/cancellation-request.repository';
import { AgentRepository } from '../agent/repositories/agent.repository';
// Schema imports
import { Customer, CustomerSchema } from '../customer/models/customer.entity';
import { Policy, PolicySchema } from './models/policy.entity';
import { Plan, PlanSchema } from '../plan/models/plan.entity';
import { Payment, PaymentSchema } from '../payment/models/payment.entity';
import { Renewal, RenewalSchema } from '../renewal/models/renewal.entity';
import {
  CancellationRequest,
  CancellationRequestSchema,
} from '../cancellation/models/cancellation-request.entity';
import { Agent, AgentSchema } from '../agent/models/agent.entity';
import { User, UserSchema } from '../auth/models/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Policy.name, schema: PolicySchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Renewal.name, schema: RenewalSchema },
      { name: CancellationRequest.name, schema: CancellationRequestSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [PolicyController],
  providers: [
    PolicyService,
    CustomerRepository,
    PolicyRepository,
    PlanRepository,
    PaymentRepository,
    RenewalRepository,
    CancellationRequestRepository,
    AgentRepository,
  ],
  exports: [PolicyService],
})
export class PolicyModule {}
