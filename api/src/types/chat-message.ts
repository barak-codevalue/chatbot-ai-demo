import { MessageRole } from './message-role';

export interface ChatMessage {
  chatId: string;
  content: string;
  role: MessageRole;
  tokenCount: number;
  createdAt: number;
}
