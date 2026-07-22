import { Component, inject } from '@angular/core';

import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-configuracion-page',
  imports: [],
  templateUrl: './configuracion-page.html',
  styleUrl: './configuracion-page.css',
})
export class ConfiguracionPage {
  private readonly agenda = inject(AppointmentService);

  protected readonly horarios = this.agenda.horarios;
}
