import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Paciente } from '../../../services/paciente.service';

export type PacienteFormData = Omit<Paciente, 'id'>;

@Component({
  selector: 'app-paciente-modal',
  imports: [FormsModule],
  templateUrl: './paciente-modal.html',
  styleUrl: './paciente-modal.css',
})
export class PacienteModal {
  // Paciente a editar; null para crear uno nuevo
  readonly paciente = input<Paciente | null>(null);

  readonly saved = output<PacienteFormData>();
  readonly closed = output<void>();

  protected readonly isEdit = computed(() => this.paciente() !== null);

  protected nombre = '';
  protected apellido = '';
  protected correo = '';
  protected telefono = '';
  protected dni = '';

  protected readonly submitted = signal(false);

  ngOnInit(): void {
    const paciente = this.paciente();

    if (paciente) {
      this.nombre = paciente.nombre;
      this.apellido = paciente.apellido;
      this.correo = paciente.correo;
      this.telefono = paciente.telefono;
      this.dni = paciente.dni;
    }
  }

  protected get nombreInvalido(): boolean {
    return this.submitted() && this.nombre.trim() === '';
  }

  protected get apellidoInvalido(): boolean {
    return this.submitted() && this.apellido.trim() === '';
  }

  protected get correoInvalido(): boolean {
    if (!this.submitted() || this.correo.trim() === '') {
      return false;
    }

    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim());
  }

  protected guardar(): void {
    this.submitted.set(true);

    if (this.nombreInvalido || this.apellidoInvalido || this.correoInvalido) {
      return;
    }

    this.saved.emit({
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      correo: this.correo.trim(),
      telefono: this.telefono.trim(),
      dni: this.dni.trim(),
    });
  }
}
