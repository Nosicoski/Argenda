import { Component, computed, inject, signal } from '@angular/core';

import {
  Profesional,
  ProfesionalService,
} from '../../../services/profesional.service';
import {
  ProfesionalFormData,
  ProfesionalModal,
} from '../profesional-modal/profesional-modal';

@Component({
  selector: 'app-profesionales-page',
  imports: [ProfesionalModal],
  templateUrl: './profesionales-page.html',
  styleUrl: './profesionales-page.css',
})
export class ProfesionalesPage {
  private readonly profesionalService = inject(ProfesionalService);

  protected readonly search = signal('');

  // Modal de alta/edición: null cerrado, 'new' para crear, Profesional para editar
  protected readonly modal = signal<Profesional | 'new' | null>(null);

  // Profesional pendiente de confirmación de borrado
  protected readonly deleting = signal<Profesional | null>(null);

  protected readonly profesionales = this.profesionalService.profesionales;

  protected readonly filtrados = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.profesionales();
    }

    return this.profesionales().filter((profesional) =>
      [
        profesional.nombre,
        profesional.apellido,
        profesional.especialidad,
        profesional.correo,
        profesional.telefono,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  });

  protected readonly editingProfesional = computed(() => {
    const modal = this.modal();

    return modal === 'new' || modal === null ? null : modal;
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected openNew(): void {
    this.modal.set('new');
  }

  protected openEdit(profesional: Profesional): void {
    this.modal.set(profesional);
  }

  protected closeModal(): void {
    this.modal.set(null);
  }

  protected save(datos: ProfesionalFormData): void {
    const editing = this.editingProfesional();

    if (editing) {
      this.profesionalService.editar({ id: editing.id, ...datos });
    } else {
      this.profesionalService.agregar(datos);
    }

    this.closeModal();
  }

  protected askDelete(profesional: Profesional): void {
    this.deleting.set(profesional);
  }

  protected cancelDelete(): void {
    this.deleting.set(null);
  }

  protected confirmDelete(): void {
    const profesional = this.deleting();

    if (profesional) {
      this.profesionalService.eliminar(profesional.id);
    }

    this.deleting.set(null);
  }
}
