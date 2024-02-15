import { Injectable } from '@nestjs/common';
import { TokenUsageRepository } from 'src/repositories/token-usage.repository';
import { TokenUsage } from 'src/types/token-usage';

@Injectable()
export class StatisticsService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}
  async addTokenUsageStatistics(usage: TokenUsage): Promise<void> {
    await this.tokenUsageRepository.createTokenUsage(usage);
  }
}
