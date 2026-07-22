import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../../services/appointment.service';
import { PacienteService } from '../../../services/paciente.service';
import { ProfesionalService } from '../../../services/profesional.service';

export interface ReservaFormData {
  paciente: string;
  profesional: string;
  servicio: string;
}

@Component({
  selector: 'app-nueva-reserva-modal',
  imports: [FormsModule],
  templateUrl: './nueva-reserva-modal.html',
  styleUrl: './nueva-reserva-modal.css',
})
export class NuevaReservaModal {
  private readonly agenda = inject(AppointmentService);
  private readonly pacienteService = inject(PacienteService);
  private readonly profesionalService = inject(ProfesionalService);

  readonly fecha = input('Lunes, 20 de julio de 2026');
  readonly hora = input('13:00');
  readonly closed = output<void>();
  readonly saved = output<ReservaFormData>();

  protected readonly pacientes = this.pacienteService.pacientes;
  protected readonly profesionales = this.profesionalService.profesionales;
  protected readonly servicios = this.agenda.servicios;

  protected paciente = '';
  protected profesional = this.agenda.profesional;
  protected servicio = '';
  protected precio = '';
  protected notas = '';

  protected readonly infoOpen = signal(false);
  protected readonly repeatOpen = signal(false);

  protected readonly repeatDays = [
    { label: 'Lun', active: true },
    { label: 'Mar', active: false },
    { label: 'Mié', active: false },
    { label: 'Jue', active: false },
    { label: 'Vie', active: false },
    { label: 'Sáb', active: false },
    { label: 'Dom', active: false },
  ];

  protected get formComplete(): boolean {
    return !!this.paciente && !!this.servicio;
  }

  protected guardar(): void {
    if (!this.formComplete) {
      return;
    }

    this.saved.emit({
      paciente: this.paciente,
      profesional: this.profesional,
      servicio: this.servicio,
    });
  }
}
