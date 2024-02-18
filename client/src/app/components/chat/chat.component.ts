import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatService } from '../../services/chat.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChatMessage } from '../../types/chat-message';

@Component({
  standalone: true,
  selector: 'chat-ai-demo-chat',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @ViewChild('scrollMe')
  private myScrollContainer!: ElementRef;

  audioPlayer = this.initAudioPlayer();

  waitingForResponse = false;

  userMessageControl = new FormControl('');

  enabledTextToSpeech = new FormControl(false);

  //ngrx /redux is foya!
  messagesSignal = signal<ChatMessage[]>(this.loadMessageHistory());
  messagesChangeEffect = effect(() => {
    this.scrollToBottom();
    this.saveMessageHistory(this.messagesSignal());
  });

  chatId: string = '';

  constructor(private chatService: ChatService) {}

  async sendMessage() {
    const userMessage = this.userMessageControl.value;
    if (!userMessage || userMessage.trim() === '') {
      return;
    }
    this.textToSpeech(userMessage, 'shimmer');
    this.updateChatMessages({
      role: 'user',
      content: userMessage,
      createdAt: Date.now(),
      chatId: this.chatId,
    });

    this.userMessageControl.setValue('');
    this.waitingForResponse = true;
    this.userMessageControl.disable();
    try {
      const completionResponse = await this.chatService.postMessage({
        chatId: this.chatId,
        content: userMessage,
      });

      if (!this.chatId) {
        this.chatId = completionResponse.chatId;
      }

      await this.textToSpeech(completionResponse.content, 'alloy');
      this.updateChatMessages(completionResponse);
    } catch (err) {
      console.error(err);
    }
    this.waitingForResponse = false;
    this.userMessageControl.enable();
  }

  clearMessages() {
    this.pauseSpeech();
    this.messagesSignal.set([]);
    localStorage.removeItem('chat');
  }

  saveMessageHistory(message: ChatMessage[]) {
    const chat = {
      chatId: this.chatId,
      messages: message,
    };
    localStorage.setItem('chat', JSON.stringify(chat));
  }

  loadMessageHistory(): ChatMessage[] {
    const storedChat = localStorage.getItem('chat');
    const chat = storedChat ? JSON.parse(storedChat) : null;
    this.chatId = chat?.chatId ?? '';
    return chat?.messages ?? [];
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop =
          this.myScrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.log(err);
      }
    }, 0);
  }

  updateChatMessages(message: ChatMessage) {
    this.messagesSignal.update((messages) => [...messages, message]);
  }

  async textToSpeech(
    text: string,
    speechVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  ) {
    if (!this.enabledTextToSpeech.value) {
      return;
    }
    const audioBlob = await this.chatService.textToSpeech(text, speechVoice);
    const audioUrl = URL.createObjectURL(audioBlob);
    this.playAudio(audioUrl);
  }

  audioQueue: string[] = [];
  playAudio(audioUrl: string) {
    if (this.audioPlayer.paused) {
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.play();
    } else {
      this.audioQueue.push(audioUrl);
    }
  }

  initAudioPlayer() {
    const audioPlayer = new Audio();
    audioPlayer.addEventListener('ended', () => {
      if (this.audioQueue.length > 0) {
        const nextAudioUrl = this.audioQueue.shift();
        if (!nextAudioUrl) {
          return;
        }
        this.audioPlayer.src = nextAudioUrl;
        this.audioPlayer.play();
      }
    });
    return audioPlayer;
  }

  pauseSpeech() {
    this.audioPlayer.pause();
  }
}
function generateCompletionOptionsForm(): FormGroup {
  return new FormGroup({
    maxTokens: new FormControl(150, [
      Validators.required,
      Validators.min(1),
      Validators.max(4000),
    ]),
    temperature: new FormControl(0.7, [
      Validators.required,
      Validators.min(0),
      Validators.max(1),
    ]),
    topP: new FormControl(0.95, [
      Validators.required,
      Validators.min(0),
      Validators.max(1),
    ]),
    frequencyPenalty: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(2),
    ]),
    presencePenalty: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(2),
    ]),
    stop: new FormControl(''),
    systemMessage: new FormControl(
      'You are an AI assistant that helps people find information.',
      Validators.required
    ),
  });
}
