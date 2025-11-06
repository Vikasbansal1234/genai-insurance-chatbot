import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PolicyNew', required: true })
  policyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['purchase', 'renewal', 'refund'] })
  type: string;

  @Prop()
  gatewayRef: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: ['pending', 'success', 'failed'], default: 'pending' })
  status: string;

  @Prop({ type: Date })
  paidAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ policyId: 1 });
PaymentSchema.index({ status: 1 });
