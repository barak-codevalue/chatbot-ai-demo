import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AiService } from 'src/core/ai.service';
import { TextToSpeechRequest } from 'src/types/text-to-speech.request';

@Controller('speech')
export class SpeechController {
  constructor(private readonly aiService: AiService) {}

  @Post('/text-to-speech')
  async textToSpeech(@Body() request: TextToSpeechRequest): Promise<Blob> {
    if (!request.text || request.text.trim() === '') {
      throw new HttpException('text is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const speechBuffer: Buffer = await this.aiService.textToSpeech(
        request.text,
        request.voice,
      );
      return new Blob([speechBuffer], { type: 'audio/mp3' });
    } catch (error) {
      console.error('Error filed to post message', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
