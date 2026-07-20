import { Component } from '@angular/core';
import { AgendaSidebar } from '../agenda-sidebar/agenda-sidebar';
import { AgendaCalendar } from '../agenda-calendar/agenda-calendar';

@Component({
  selector: 'app-agenda-page',
  imports: [AgendaSidebar, AgendaCalendar],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.css',
})
export class AgendaPage {}
