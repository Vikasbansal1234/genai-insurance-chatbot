import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['health', 'life', 'motor', 'home'] })
  category: string;

  @Prop({ required: true, min: 0 })
  basePremium: number;

  @Prop({ type: Object, required: true })
  coverage: {
    sumInsured: number;
    riders: string[];
  };
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
PlanSchema.index({ code: 1 });
PlanSchema.index({ category: 1 });
