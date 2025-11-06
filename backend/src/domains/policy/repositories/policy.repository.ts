import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from '../models/policy.entity';

@Injectable()
export class PolicyRepository {
  constructor(@InjectModel(Policy.name) private policyModel: Model<PolicyDocument>) {}

  async create(data: Partial<Policy>): Promise<PolicyDocument> {
    return this.policyModel.create(data);
  }

  async findById(id: string): Promise<PolicyDocument | null> {
    return this.policyModel
      .findById(id)
      .populate('customerId')
      .populate('planId')
      .populate('agentId')
      .exec();
  }

  async findByPolicyNumber(policyNumber: string): Promise<PolicyDocument | null> {
    return this.policyModel.findOne({ policyNumber }).exec();
  }

  async findByCustomerId(customerId: string): Promise<PolicyDocument[]> {
    return this.policyModel.find({ customerId }).populate('planId').populate('agentId').exec();
  }

  async findAll(): Promise<PolicyDocument[]> {
    return this.policyModel
      .find()
      .populate('customerId')
      .populate('planId')
      .populate('agentId')
      .exec();
  }

  async update(id: string, data: Partial<Policy>): Promise<PolicyDocument | null> {
    return this.policyModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(id: string, status: string): Promise<PolicyDocument | null> {
    return this.policyModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.policyModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
