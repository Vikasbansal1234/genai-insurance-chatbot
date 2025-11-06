import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RenewalDocument = Renewal & Document;

@Schema({ timestamps: true })
export class Renewal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PolicyNew', required: true })
  policyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  previousEnd: Date;

  @Prop({ type: Date, required: true })
  newEnd: Date;

  @Prop({ required: true, enum: ['requested', 'completed', 'failed'], default: 'requested' })
  status: string;
}

export const RenewalSchema = SchemaFactory.createForClass(Renewal);
RenewalSchema.index({ policyId: 1 });
