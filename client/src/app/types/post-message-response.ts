import { MessageRole } from "./chat-message";

export interface PostMessageResponse {
  chatId: string;
  content: string;
  role: MessageRole;
  createdAt: number;
}
