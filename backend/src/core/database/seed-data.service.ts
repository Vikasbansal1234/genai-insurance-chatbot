import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from '../../domains/plan/models/plan.entity';
import { Agent } from '../../domains/agent/models/agent.entity';

@Injectable()
export class SeedDataService implements OnModuleInit {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<any>,
    @InjectModel(Agent.name) private agentModel: Model<any>,
  ) {}

  async onModuleInit() {
    await this.seedPlans();
    await this.seedAgents();
  }

  private async seedPlans() {
    const count = await this.planModel.countDocuments();
    if (count > 0) {
      return;
    }

    const plans = [
      {
        code: 'HEALTH-BASIC',
        name: 'Basic Health Insurance',
        category: 'health',
        basePremium: 1200,
        coverage: {
          sumInsured: 500000,
          riders: ['OPD', 'Critical Illness'],
        },
      },
      {
        code: 'HEALTH-PREMIUM',
        name: 'Premium Health Insurance',
        category: 'health',
        basePremium: 2500,
        coverage: {
          sumInsured: 1000000,
          riders: ['OPD', 'Critical Illness', 'Maternity', 'Dental'],
        },
      },
      {
        code: 'LIFE-TERM',
        name: 'Term Life Insurance',
        category: 'life',
        basePremium: 800,
        coverage: {
          sumInsured: 5000000,
          riders: ['Accidental Death', 'Critical Illness'],
        },
      },
      {
        code: 'MOTOR-COMPREHENSIVE',
        name: 'Comprehensive Motor Insurance',
        category: 'motor',
        basePremium: 1500,
        coverage: {
          sumInsured: 300000,
          riders: ['Zero Depreciation', 'Engine Protection'],
        },
      },
      {
        code: 'HOME-STANDARD',
        name: 'Standard Home Insurance',
        category: 'home',
        basePremium: 1000,
        coverage: {
          sumInsured: 2000000,
          riders: ['Earthquake', 'Fire', 'Theft'],
        },
      },
    ];

    await this.planModel.insertMany(plans);
  }

  private async seedAgents() {
    const count = await this.agentModel.countDocuments();
    if (count > 0) {
      return;
    }

    const agents = [
      {
        code: 'AGT001',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@insurance.com',
      },
      {
        code: 'AGT002',
        name: 'Priya Sharma',
        email: 'priya.sharma@insurance.com',
      },
      {
        code: 'AGT003',
        name: 'Amit Patel',
        email: 'amit.patel@insurance.com',
      },
    ];

    await this.agentModel.insertMany(agents);
  }
}
