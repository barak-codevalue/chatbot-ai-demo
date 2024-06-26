import { MessageRole } from './message-role';

export interface PostMessageResponse {
  content: string;
  chatId: string;
  role: MessageRole;
  createdAt: number;
}
