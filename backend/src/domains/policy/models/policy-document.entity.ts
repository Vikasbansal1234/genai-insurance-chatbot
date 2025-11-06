import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PolicyDocumentDocument = PolicyDocument & Document;

@Schema({ timestamps: true })
export class PolicyDocument {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PolicyNew', required: true })
  policyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  fileKey: string; // S3/GCS key

  @Prop({ required: true })
  mime: string;
}

export const PolicyDocumentSchema = SchemaFactory.createForClass(PolicyDocument);
PolicyDocumentSchema.index({ policyId: 1 });
