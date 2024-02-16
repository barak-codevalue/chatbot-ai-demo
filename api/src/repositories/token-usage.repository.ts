import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenUsageDocument } from './schemas/token-usage.schema';
import { TokenUsage } from 'src/types/token-usage';
@Injectable()
export class TokenUsageRepository {
  constructor(
    @InjectModel(TokenUsageDocument.name)
    private tokenUsageModel: Model<TokenUsageDocument>,
  ) {}
  async createTokenUsage(tokenUsage: TokenUsage) {
    await this.tokenUsageModel.create({
      createdAt: Date.now(),
      chatId: tokenUsage.chatId,
      tokens: tokenUsage.tokens | 0,
    });
  }
}
