import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../models/agent.entity';

@Injectable()
export class AgentRepository {
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {}

  async create(data: Partial<Agent>): Promise<AgentDocument> {
    return this.agentModel.create(data);
  }

  async findById(id: string): Promise<AgentDocument | null> {
    return this.agentModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<AgentDocument | null> {
    return this.agentModel.findOne({ email }).exec();
  }

  async findAll(): Promise<AgentDocument[]> {
    return this.agentModel.find().exec();
  }

  async findFirstActive(): Promise<AgentDocument | null> {
    return this.agentModel.findOne({ status: 'active' }).exec();
  }

  async update(id: string, data: Partial<Agent>): Promise<AgentDocument | null> {
    return this.agentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.agentModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
