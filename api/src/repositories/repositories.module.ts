import { Module } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatDocument, ChatDocumentSchema } from './schemas/chat.schema';
import { TokenUsageRepository } from './token-usage.repository';
import {
  TokenUsageDocument,
  TokenUsageDocumentSchema,
} from './schemas/token-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatDocument.name, schema: ChatDocumentSchema },
      { name: TokenUsageDocument.name, schema: TokenUsageDocumentSchema },
    ]),
  ],
  controllers: [],
  providers: [ChatRepository, TokenUsageRepository],
  exports: [ChatRepository, TokenUsageRepository],
})
export class RepositoriesModule {}
