import { Injectable, signal } from '@angular/core';

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  dni: string;
}

const STORAGE_KEY = 'argenda_pacientes';

// Pacientes de ejemplo: se cargan la primera vez que se abre la página
const PACIENTES_MOCK: Paciente[] = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'González',
    correo: 'maria.gonzalez@gmail.com',
    telefono: '+54 9 11 5555-1234',
    dni: '32.456.789',
  },
  {
    id: 2,
    nombre: 'Lucas',
    apellido: 'Fernández',
    correo: 'lucas.fernandez@gmail.com',
    telefono: '+54 9 11 5555-9876',
    dni: '28.987.654',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private readonly pacientesSignal = signal<Paciente[]>(this.load());

  readonly pacientes = this.pacientesSignal.asReadonly();

  agregar(datos: Omit<Paciente, 'id'>): void {
    const paciente: Paciente = { id: Date.now(), ...datos };

    this.update([...this.pacientesSignal(), paciente]);
  }

  editar(paciente: Paciente): void {
    this.update(
      this.pacientesSignal().map((existente) =>
        existente.id === paciente.id ? paciente : existente,
      ),
    );
  }

  eliminar(id: number): void {
    this.update(
      this.pacientesSignal().filter((paciente) => paciente.id !== id),
    );
  }

  private update(pacientes: Paciente[]): void {
    this.pacientesSignal.set(pacientes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
  }

  private load(): Paciente[] {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PACIENTES_MOCK));
      return PACIENTES_MOCK;
    }

    try {
      const pacientes = JSON.parse(stored);

      return Array.isArray(pacientes) ? pacientes : PACIENTES_MOCK;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return PACIENTES_MOCK;
    }
  }
}
