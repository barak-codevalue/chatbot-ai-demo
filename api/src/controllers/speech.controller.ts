import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import { AiService } from 'src/core/ai.service';
import { TextToSpeechRequest } from 'src/types/text-to-speech.request';

@Controller('speech')
export class SpeechController {
  constructor(private readonly aiService: AiService) {}

  @Post('/text-to-speech')
  async textToSpeech(
    @Body() request: TextToSpeechRequest,
  ): Promise<StreamableFile> {
    if (!request.text || request.text.trim() === '') {
      throw new HttpException('text is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const speechBuffer: Buffer = await this.aiService.textToSpeech(
        request.text,
        request.voice,
      );
      console.log('speechBuffer', speechBuffer.length);

      const stream = new Readable();
      stream.push(speechBuffer);
      stream.push(null);
      return new StreamableFile(stream);
    } catch (error) {
      console.error('Error filed to textToSpeech', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
