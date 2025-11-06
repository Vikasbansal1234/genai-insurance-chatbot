import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CancellationRequestDocument = CancellationRequest & Document;

@Schema({ timestamps: true })
export class CancellationRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PolicyNew', required: true })
  policyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({
    required: true,
    enum: ['requested', 'approved', 'rejected', 'refunded'],
    default: 'requested',
  })
  status: string;

  @Prop({ type: Date, required: true, default: Date.now })
  requestedAt: Date;

  @Prop({ type: Date })
  resolvedAt: Date;
}

export const CancellationRequestSchema = SchemaFactory.createForClass(CancellationRequest);
CancellationRequestSchema.index({ policyId: 1 });
CancellationRequestSchema.index({ status: 1 });
