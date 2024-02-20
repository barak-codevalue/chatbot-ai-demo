import {
  Controller,
  UploadedFile,
  Post,
  UseInterceptors,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScraperService } from 'src/core/scraper.service';
import { BasicAdminAuthGuard } from 'src/guards/basic-admin-auth.guard';
import { TrainService } from 'src/services/train.service';
import { TrainWebSiteRequest } from 'src/types/train-web-site-request';

@Controller('train')
@UseGuards(BasicAdminAuthGuard)
export class TrainController {
  constructor(
    private readonly trainService: TrainService,
    private readonly scraperService: ScraperService,
  ) {}

  @Post('/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file.mimetype.includes('text')) {
      throw new Error('Invalid file type');
    }

    await this.trainService.indexDocument(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Post('/website')
  async trainWebSite(@Body() trainWebSiteRequest: TrainWebSiteRequest) {
    await this.trainService.indexSite(trainWebSiteRequest.url);
  }
}
