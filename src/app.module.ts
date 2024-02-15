import { Module } from '@nestjs/common';
import { TrainController } from './controllers/train.controller';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { TrainService } from './services/train.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiService } from './core/ai.service';
import { RepositoriesModule } from './repositories/repositories.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsService } from './core/statistics.service';
import { BasicAdminAuthGuard } from './guards/basic-admin-auth.guard';
import { ScraperService } from './core/scraper.service';
import { HealthController } from './controllers/health.controller';
import { IndexService } from './core/index.service';

@Module({
  imports: [
    RepositoriesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_CONNECTION_STRING'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController, TrainController, HealthController],
  providers: [
    ChatService,
    TrainService,
    AiService,
    IndexService,
    StatisticsService,
    BasicAdminAuthGuard,
    ScraperService,
  ],
})
export class AppModule {}
