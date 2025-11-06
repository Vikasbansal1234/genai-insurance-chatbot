import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PdfEmbedding extends Document {
  @Prop({ required: true })
  text: string; // The text chunk

  @Prop({ required: true, type: [Number] })
  embedding: number[]; // The vector embedding

  @Prop({
    type: Object,
    default: {},
  })
  metadata?: {
    userId?: string; // ✅ User ID who uploaded this document
    fileName?: string;
    chunkIndex?: number;
  };
}

export const PdfEmbeddingSchema = SchemaFactory.createForClass(PdfEmbedding);

// ✅ Add index on metadata.userId for fast filtering
PdfEmbeddingSchema.index({ 'metadata.userId': 1 });
