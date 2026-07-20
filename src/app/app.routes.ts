import { Routes } from '@angular/router';
import { AgendaPage } from './features/agenda/agenda-page/agenda-page';

export const routes: Routes = [
  { path: '', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'agenda', component: AgendaPage },
];
