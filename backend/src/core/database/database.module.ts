import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { SeedDataService } from './seed-data.service';
import { User, UserSchema } from '../../domains/auth/models/user.entity';
import { Policy, PolicySchema } from '../../domains/policy/models/policy.entity';
import { PdfEmbedding, PdfEmbeddingSchema } from '../../domains/pdf/models/embedding.entity';
// New schema imports
import { Customer, CustomerSchema } from '../../domains/customer/models/customer.entity';
import { Agent, AgentSchema } from '../../domains/agent/models/agent.entity';
import { Plan, PlanSchema } from '../../domains/plan/models/plan.entity';
import { Payment, PaymentSchema } from '../../domains/payment/models/payment.entity';
import { Renewal, RenewalSchema } from '../../domains/renewal/models/renewal.entity';
import {
  CancellationRequest,
  CancellationRequestSchema,
} from '../../domains/cancellation/models/cancellation-request.entity';
import {
  PolicyDocument,
  PolicyDocumentSchema,
} from '../../domains/policy/models/policy-document.entity';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || process.env.MONGODB_ATLAS_URI,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Policy.name, schema: PolicySchema },
      { name: PdfEmbedding.name, schema: PdfEmbeddingSchema },
      // New schemas
      { name: Customer.name, schema: CustomerSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Policy.name, schema: PolicySchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Renewal.name, schema: RenewalSchema },
      { name: CancellationRequest.name, schema: CancellationRequestSchema },
      { name: PolicyDocument.name, schema: PolicyDocumentSchema },
    ]),
  ],
  providers: [DatabaseService, SeedDataService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {}
