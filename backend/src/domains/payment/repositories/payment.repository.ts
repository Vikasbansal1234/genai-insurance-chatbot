import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../models/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  async create(data: Partial<Payment>): Promise<PaymentDocument> {
    return this.paymentModel.create(data);
  }

  async findById(id: string): Promise<PaymentDocument | null> {
    return this.paymentModel.findById(id).populate('policyId').exec();
  }

  async findByPolicyId(policyId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ policyId }).exec();
  }

  async updateStatus(id: string, status: string, paidAt?: Date): Promise<PaymentDocument | null> {
    const updateData: any = { status };
    if (paidAt) updateData.paidAt = paidAt;
    return this.paymentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
