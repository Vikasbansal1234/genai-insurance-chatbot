import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Renewal, RenewalDocument } from '../models/renewal.entity';

@Injectable()
export class RenewalRepository {
  constructor(@InjectModel(Renewal.name) private renewalModel: Model<RenewalDocument>) {}

  async create(data: Partial<Renewal>): Promise<RenewalDocument> {
    return this.renewalModel.create(data);
  }

  async findById(id: string): Promise<RenewalDocument | null> {
    return this.renewalModel.findById(id).populate('policyId').exec();
  }

  async findByPolicyId(policyId: string): Promise<RenewalDocument[]> {
    return this.renewalModel.find({ policyId }).exec();
  }

  async updateStatus(id: string, status: string): Promise<RenewalDocument | null> {
    return this.renewalModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
