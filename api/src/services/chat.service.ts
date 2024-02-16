import { Injectable } from '@nestjs/common';
import { Chat } from '../types/chat';
import { ChatRepository } from 'src/repositories/chat.repository';
import { ConfigService } from '@nestjs/config';
import { decode, encode } from 'gpt-3-encoder';
import { ChatMessage } from 'src/types/chat-message';
import { AiService } from 'src/core/ai.service';
import { CHAT_CONTEXT } from 'src/core/prompts';
import { MessageRole } from 'src/types/message-role';
import { IndexService } from 'src/core/index.service';

@Injectable()
export class ChatService {
  private readonly maxHistoryTokens: number;
  private readonly addedContextMaxTokens: number;

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
    private readonly indexService: IndexService,
  ) {
    this.maxHistoryTokens = parseInt(
      this.configService.get<string>('MAX_HISTORY_TOKENS') || '500',
    );
    this.addedContextMaxTokens = parseInt(
      this.configService.get<string>('ADDED_CONTEXT_MAX_TOKENS') || '300',
    );
  }

  async createChat(): Promise<Chat> {
    const chat = await this.chatRepository.createChat();
    return {
      chatId: chat.chatId,
    };
  }

  async postMessage(chatId: string, message: string): Promise<string> {
    const chat = await this.chatRepository.getChat(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const userMessage = this.buildMessage(chat.chatId, message, 'user');
    await this.chatRepository.addMessage(chat.chatId, userMessage);

    const messageHistory = this.selectRecentMessagesUpToMaxTokens(
      chat.messages,
    );

    const context = await this.generateContext(message);

    const systemMessage = this.buildMessage(chat.chatId, context, 'system');

    const chatMessages = [systemMessage, ...messageHistory, userMessage];
    const response = await this.aiService.createCompletions(chatMessages);

    const responseMessage = this.buildMessage(
      chat.chatId,
      response.message,
      'assistant',
    );

    await this.chatRepository.addMessage(chatId, responseMessage);

    return response.message;
  }

  private buildMessage(
    chatId: string,
    message: string,
    role: MessageRole,
  ): ChatMessage {
    return {
      chatId: chatId,
      content: message,
      role: role,
      createdAt: Date.now(),
      tokenCount: encode(message).length,
    };
  }

  private async generateContext(message: string): Promise<string> {
    try {
      const embeddingsResult = await this.aiService.createEmbeddings([message]);
      const similarityResult = await this.indexService.similaritySearch(
        embeddingsResult.embeddingsItems[0].embeddings,
      );

      const context = similarityResult.join('\n\n');
      const contextTokens = encode(context);
      const fitContextTokens = contextTokens.slice(
        0,
        this.addedContextMaxTokens,
      );
      const fitContext = decode(fitContextTokens);
      console.info('Client message', message);
      console.info('Context', fitContext);

      return CHAT_CONTEXT.replace('{context}', fitContext);
    } catch (error) {
      console.error('filed to generateContext', error);
      return CHAT_CONTEXT;
    }
  }

  private selectRecentMessagesUpToMaxTokens(
    messages: ChatMessage[],
  ): ChatMessage[] {
    const messageHistory = [];
    const reversMessages = [...messages].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    let historyTokensCount = 0;
    for (const message of reversMessages) {
      if (historyTokensCount + message.tokenCount > this.maxHistoryTokens) {
        break;
      }
      messageHistory.push(message);
      historyTokensCount += message.tokenCount;
    }
    return messageHistory;
  }
}
