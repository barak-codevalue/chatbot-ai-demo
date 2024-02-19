import { Route } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { AdminComponent } from './components/admin/admin.component';
import { TrainComponent } from './components/train/train.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent },
  { path: 'external', component: TrainComponent },
  { path: 'admin', component: AdminComponent },
];
