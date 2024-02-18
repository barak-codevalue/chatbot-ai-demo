import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PostMessageRequest } from '../types/post-message.request';
import { PostMessageResponse } from '../types/post-message-response';
import { ChatMessage } from '../types/chat-message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:8080';
  private postMessageEndpoint = `${this.apiUrl}/chat/message`;
  private textToSpeechEndpoint = `${this.apiUrl}/speech/text-to-speech`;
  private trainWithFileEndpoint = `${this.apiUrl}/train/document`;
  private trainWithWebsiteEndpoint = `${this.apiUrl}/train/website`;
  private adminUsername = 'admin';
  private adminPassword = '6~VVkW%Yo?gbnKoAoI7MR32LE@';

  constructor(private http: HttpClient) {}
  async postMessage(messagePost: PostMessageRequest): Promise<ChatMessage> {
    return firstValueFrom(
      this.http.post<PostMessageResponse>(this.postMessageEndpoint, messagePost)
    );
  }

  async textToSpeech(text: string, speechVoice?: string): Promise<Blob> {
    return firstValueFrom(
      this.http.post(
        this.textToSpeechEndpoint,
        {
          text,
          speechVoice,
        },
        { responseType: 'blob' }
      )
    );
  }

  async trainWithFile(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return firstValueFrom(
      this.http.post(this.trainWithFileEndpoint, formData, {
        headers: {
          Authorization: `Basic ${btoa(
            `${this.adminUsername}:${this.adminPassword}`
          )}`,
        },
      })
    );
  }

  async trainSiteUrl(url: string): Promise<unknown> {
    return firstValueFrom(
      this.http.post(
        this.trainWithWebsiteEndpoint,
        { url },
        {
          headers: {
            Authorization: `Basic ${btoa(
              `${this.adminUsername}:${this.adminPassword}`
            )}`,
          },
        }
      )
    );
  }
}
