import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TokenUsageDocument extends Document {
  @Prop({ required: true })
  createdAt: number;

  @Prop({ required: true })
  chatId: string;

  @Prop({ required: true })
  tokens: number;
}

export const TokenUsageDocumentSchema =
  SchemaFactory.createForClass(TokenUsageDocument);
