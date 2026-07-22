import { Component, computed, inject, signal } from '@angular/core';

import {
  Paciente,
  PacienteService,
} from '../../../services/paciente.service';
import {
  PacienteFormData,
  PacienteModal,
} from '../paciente-modal/paciente-modal';

@Component({
  selector: 'app-pacientes-page',
  imports: [PacienteModal],
  templateUrl: './pacientes-page.html',
  styleUrl: './pacientes-page.css',
})
export class PacientesPage {
  private readonly pacienteService = inject(PacienteService);

  protected readonly search = signal('');

  // Modal de alta/edición: null cerrado, 'new' para crear, Paciente para editar
  protected readonly modal = signal<Paciente | 'new' | null>(null);

  // Paciente pendiente de confirmación de borrado
  protected readonly deleting = signal<Paciente | null>(null);

  protected readonly pacientes = this.pacienteService.pacientes;

  protected readonly filtrados = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.pacientes();
    }

    return this.pacientes().filter((paciente) =>
      [
        paciente.nombre,
        paciente.apellido,
        paciente.correo,
        paciente.telefono,
        paciente.dni,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  });

  protected readonly editingPaciente = computed(() => {
    const modal = this.modal();

    return modal === 'new' || modal === null ? null : modal;
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected openNew(): void {
    this.modal.set('new');
  }

  protected openEdit(paciente: Paciente): void {
    this.modal.set(paciente);
  }

  protected closeModal(): void {
    this.modal.set(null);
  }

  protected save(datos: PacienteFormData): void {
    const editing = this.editingPaciente();

    if (editing) {
      this.pacienteService.editar({ id: editing.id, ...datos });
    } else {
      this.pacienteService.agregar(datos);
    }

    this.closeModal();
  }

  protected askDelete(paciente: Paciente): void {
    this.deleting.set(paciente);
  }

  protected cancelDelete(): void {
    this.deleting.set(null);
  }

  protected confirmDelete(): void {
    const paciente = this.deleting();

    if (paciente) {
      this.pacienteService.eliminar(paciente.id);
    }

    this.deleting.set(null);
  }
}
