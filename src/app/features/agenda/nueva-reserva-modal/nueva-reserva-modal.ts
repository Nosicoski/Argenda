import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nueva-reserva-modal',
  imports: [FormsModule],
  templateUrl: './nueva-reserva-modal.html',
  styleUrl: './nueva-reserva-modal.css',
})
export class NuevaReservaModal {
  readonly fecha = input('Lunes, 20 de julio de 2026');
  readonly hora = input('13:00');
  readonly closed = output<void>();

  // Estado del formulario (solo diseño)
  protected paciente = '';
  protected profesional = 'Juan Nosicoski';
  protected servicio = '';
  protected precio = '';
  protected notas = '';

  protected readonly infoOpen = signal(false);
  protected readonly repeatOpen = signal(false);

  // Días del popover de repetición (solo diseño)
  protected readonly repeatDays = [
    { label: 'Lun', active: true },
    { label: 'Mar', active: false },
    { label: 'Mié', active: false },
    { label: 'Jue', active: false },
    { label: 'Vie', active: false },
    { label: 'Sáb', active: false },
    { label: 'Dom', active: false },
  ];

  // Los botones de acción se habilitan cuando el formulario está completo
  protected get formComplete(): boolean {
    return !!this.paciente && !!this.servicio;
  }
}
