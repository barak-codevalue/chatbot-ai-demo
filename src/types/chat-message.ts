import { MessageRole } from './message-role';

export class ChatMessage {
  chatId: string;
  content: string;
  role: MessageRole;
  tokenCount: number;
  createdAt: number;
}
