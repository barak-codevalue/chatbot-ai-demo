import { Route } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
//import { ExtractDataComponent } from './components/extract-data/extract-data.component';
import { AdminComponent } from './components/admin/admin.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent },
  //{ path: 'extract-data', component: ExtractDataComponent },
  { path: 'admin', component: AdminComponent },
];
