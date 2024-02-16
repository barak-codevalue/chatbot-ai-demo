import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from 'src/types/chat';
import { ChatMessage } from 'src/types/chat-message';
import { ChatDocument } from './schemas/chat.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatDocument.name) private chatModel: Model<ChatDocument>,
  ) {}

  async createChat(): Promise<Chat> {
    const chatDocument = await this.chatModel.create({
      chatId: uuidv4(),
    });
    return {
      chatId: chatDocument.chatId,
    };
  }

  async getChat(chatId: string): Promise<Chat | undefined> {
    const chatDocument = await this.chatModel.findOne({ chatId });
    if (!chatDocument) {
      return undefined;
    }
    return {
      chatId: chatDocument.chatId,
      messages: chatDocument.messages,
    };
  }

  async addMessage(chatId: string, message: ChatMessage) {
    await this.chatModel.updateOne(
      { chatId },
      { $push: { messages: message } },
    );
  }
}
