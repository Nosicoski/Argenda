import { Injectable, signal } from '@angular/core';

export interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  correo: string;
  telefono: string;
}

const STORAGE_KEY = 'argenda_profesionales';

// Profesionales de ejemplo: se cargan la primera vez que se abre la página
const PROFESIONALES_MOCK: Profesional[] = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Nosicoski',
    especialidad: 'Psicología',
    correo: 'juan.nosicoski@argenda.com',
    telefono: '+54 9 11 5555-0001',
  },
  {
    id: 2,
    nombre: 'Sofía',
    apellido: 'Ramírez',
    especialidad: 'Estética',
    correo: 'sofia.ramirez@argenda.com',
    telefono: '+54 9 11 5555-0002',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProfesionalService {
  private readonly profesionalesSignal = signal<Profesional[]>(this.load());

  readonly profesionales = this.profesionalesSignal.asReadonly();

  agregar(datos: Omit<Profesional, 'id'>): void {
    const profesional: Profesional = { id: Date.now(), ...datos };

    this.update([...this.profesionalesSignal(), profesional]);
  }

  editar(profesional: Profesional): void {
    this.update(
      this.profesionalesSignal().map((existente) =>
        existente.id === profesional.id ? profesional : existente,
      ),
    );
  }

  eliminar(id: number): void {
    this.update(
      this.profesionalesSignal().filter(
        (profesional) => profesional.id !== id,
      ),
    );
  }

  private update(profesionales: Profesional[]): void {
    this.profesionalesSignal.set(profesionales);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profesionales));
  }

  private load(): Profesional[] {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PROFESIONALES_MOCK));
      return PROFESIONALES_MOCK;
    }

    try {
      const profesionales = JSON.parse(stored);

      return Array.isArray(profesionales)
        ? profesionales
        : PROFESIONALES_MOCK;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return PROFESIONALES_MOCK;
    }
  }
}
