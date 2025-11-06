import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PolicyDocument = Policy & Document;

@Schema({ timestamps: true })
export class Policy {
  @Prop({ required: true, unique: true })
  policyNumber: string;

  @Prop({ required: true, enum: ['pending', 'active', 'lapsed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ required: true, min: 0 })
  premium: number;

  @Prop({ type: Object, required: true })
  insured: {
    name: string;
    relation: string;
    dob: Date;
  };

  @Prop({ type: [Object], default: [] })
  beneficiaries: Array<{
    name: string;
    relation: string;
  }>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Plan', required: true })
  planId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agent' })
  agentId: MongooseSchema.Types.ObjectId;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
PolicySchema.index({ policyNumber: 1 });
PolicySchema.index({ customerId: 1 });
PolicySchema.index({ status: 1 });
