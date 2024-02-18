import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { ChatMessage } from 'src/types/chat-message';
import { CompletionResult } from 'src/types/completion-result';
import { EmbeddingsItems, EmbeddingsResult } from 'src/types/embeddings-result';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly maxTokens: number;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.maxTokens = parseInt(
      this.configService.get<string>('COMPLETION_MAX_TOKENS') || '150',
    );

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async createCompletions(
    chatMessages: ChatMessage[],
  ): Promise<CompletionResult> {
    const messages: ChatCompletionMessageParam[] = chatMessages.map(
      (message) => ({
        role: message.role,
        content: message.content,
      }),
    );
    const result = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: this.maxTokens,
    });

    const completion = result.choices[0].message?.content;
    if (!completion) {
      throw new Error('failed to generate completion');
    }
    const totalTokens = result.usage?.total_tokens || 0;
    return {
      message: completion,
      tokenUsage: totalTokens,
    };
  }

  async createEmbeddings(inputs: string[]): Promise<EmbeddingsResult> {
    const batchSize = 16;
    let totalTokenUsage = 0;
    const allEmbeddingsItems: EmbeddingsItems[] = [];
    const batches = [];
    let index = 0;
    for (let i = 0; i < inputs.length; i += batchSize) {
      batches.push({
        batchIndex: index,
        inputs: inputs.slice(i, i + batchSize),
      });
      index++;
    }
    try {
      await Promise.all(
        batches.map(async (batch) => {
          const embeddingsResult = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: batch.inputs,
          });
          totalTokenUsage += embeddingsResult.usage?.total_tokens || 0;
          const embeddingsItems = embeddingsResult.data.map((item) => {
            return {
              index: item.index + batch.batchIndex * batchSize,
              embeddings: item.embedding,
            };
          });
          allEmbeddingsItems.push(...embeddingsItems);
        }),
      );
    } catch (error) {
      console.error('Error failed to createEmbeddings', error);
    }

    return {
      embeddingsItems: allEmbeddingsItems,
      tokenUsage: totalTokenUsage,
    };
  }

  async textToSpeech(
    text: string,
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
  ): Promise<Buffer> {
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: voice ?? 'alloy',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  }
}
