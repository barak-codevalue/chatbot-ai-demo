import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChatMessage } from 'src/types/chat-message';

@Schema()
export class ChatDocument extends Document {
  @Prop({ required: true, unique: true })
  chatId: string;

  @Prop({ required: true, default: Date.now() })
  createdAt: number;

  @Prop({ required: false, default: [] })
  messages: ChatMessage[];
}

export const ChatDocumentSchema = SchemaFactory.createForClass(ChatDocument);
