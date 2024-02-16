import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { PostMessageRequest } from 'src/types/post-message.request';
import { PostMessageResponse } from 'src/types/post-message-response';
import { ChatMessage } from 'src/types/chat-message';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/message')
  async postMessage(
    @Body() postMessage: PostMessageRequest,
  ): Promise<PostMessageResponse> {
    if (!postMessage.content) {
      throw new HttpException('message is required', HttpStatus.BAD_REQUEST);
    }

    const chatId =
      postMessage.chatId || (await this.chatService.createChat()).chatId;

    try {
      const response: ChatMessage = await this.chatService.postMessage(
        chatId,
        postMessage.content,
      );
      return {
        content: response.content,
        createdAt: response.createdAt,
        role: response.role,
        chatId,
      };
    } catch (error) {
      console.error('Error filed to post message', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
