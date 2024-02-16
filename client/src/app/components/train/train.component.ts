import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'chat-ai-demo-train',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './train.component.html',
  styleUrl: './train.component.scss',
})
export class TrainComponent {
  adminUsername: string = '';
  adminPassword: string = '';
  websiteUrl: string = '';
  selectedFile: File | null = null;
  isUploading: boolean = false;
  isTraining: boolean = false;
  uploadSuccessMessage: string = '';
  trainSuccessMessage: string = '';
  adminCredentials: string = '';

  constructor(private chatService: ChatService) {}

  setCredentials() {
    this.adminCredentials = btoa(`${this.adminUsername}:${this.adminPassword}`);
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedFile = fileList[0];
    }
  }

  async uploadDocument() {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    try {
      await this.chatService.trainWithFile(
        this.selectedFile,
        this.adminCredentials
      );
      this.uploadSuccessMessage = 'Document uploaded successfully!';
    } catch (error) {
      console.error('Error uploading document:', error);
      this.uploadSuccessMessage = 'Document upload failed!';
    } finally {
      this.isUploading = false;
    }
  }

  async trainWebsite() {
    this.isTraining = true;
    try {
      this.chatService.trainSiteUrl(this.websiteUrl, this.adminCredentials);
      this.trainSuccessMessage = 'Website trained successfully!';
    } catch (error) {
      console.error('Error training website:', error);
      this.trainSuccessMessage = 'Website training failed!';
    } finally {
      this.isTraining = false;
    }
  }
}
