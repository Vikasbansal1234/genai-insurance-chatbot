import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CancellationRequest,
  CancellationRequestDocument,
} from '../models/cancellation-request.entity';

@Injectable()
export class CancellationRequestRepository {
  constructor(
    @InjectModel(CancellationRequest.name)
    private cancellationModel: Model<CancellationRequestDocument>,
  ) {}

  async create(data: Partial<CancellationRequest>): Promise<CancellationRequestDocument> {
    return this.cancellationModel.create(data);
  }

  async findById(id: string): Promise<CancellationRequestDocument | null> {
    return this.cancellationModel.findById(id).populate('policyId').exec();
  }

  async findByPolicyId(policyId: string): Promise<CancellationRequestDocument[]> {
    return this.cancellationModel.find({ policyId }).exec();
  }

  async updateStatus(
    id: string,
    status: string,
    resolvedAt?: Date,
  ): Promise<CancellationRequestDocument | null> {
    const updateData: any = { status };
    if (resolvedAt) updateData.resolvedAt = resolvedAt;
    return this.cancellationModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
