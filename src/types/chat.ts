import { ChatMessage } from './chat-message';

export interface Chat {
  chatId: string;
  messages?: ChatMessage[];
}
