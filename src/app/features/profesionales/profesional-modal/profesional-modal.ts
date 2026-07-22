import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Profesional } from '../../../services/profesional.service';

export type ProfesionalFormData = Omit<Profesional, 'id'>;

@Component({
  selector: 'app-profesional-modal',
  imports: [FormsModule],
  templateUrl: './profesional-modal.html',
  styleUrl: './profesional-modal.css',
})
export class ProfesionalModal {
  // Profesional a editar; null para crear uno nuevo
  readonly profesional = input<Profesional | null>(null);

  readonly saved = output<ProfesionalFormData>();
  readonly closed = output<void>();

  protected readonly isEdit = computed(() => this.profesional() !== null);

  protected nombre = '';
  protected apellido = '';
  protected especialidad = '';
  protected correo = '';
  protected telefono = '';

  protected readonly submitted = signal(false);

  ngOnInit(): void {
    const profesional = this.profesional();

    if (profesional) {
      this.nombre = profesional.nombre;
      this.apellido = profesional.apellido;
      this.especialidad = profesional.especialidad;
      this.correo = profesional.correo;
      this.telefono = profesional.telefono;
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
      especialidad: this.especialidad.trim(),
      correo: this.correo.trim(),
      telefono: this.telefono.trim(),
    });
  }
}
