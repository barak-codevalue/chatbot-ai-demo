export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  chatId: string;
  content: string;
  role: MessageRole;
  createdAt: number;
}
