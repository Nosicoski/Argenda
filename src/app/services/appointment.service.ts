import { Injectable, signal } from '@angular/core';

export interface AgendaReserva {
  id: number;
  fecha: string;
  hora: string;
  cliente: string;
  servicio: string;
}

const STORAGE_KEY = 'argenda_agenda';

const RESERVAS_MOCK: AgendaReserva[] = [
  {
    id: 1,
    fecha: '2026-07-20',
    hora: '10:00',
    cliente: 'María González',
    servicio: 'Limpieza facial',
  },
  {
    id: 2,
    fecha: '2026-07-22',
    hora: '15:00',
    cliente: 'Lucas Fernández',
    servicio: 'Masaje relajante',
  },
  {
    id: 3,
    fecha: '2026-07-21',
    hora: '11:00',
    cliente: 'Valentina López',
    servicio: 'Manicura',
  },
  {
    id: 4,
    fecha: '2026-07-24',
    hora: '17:00',
    cliente: 'Martín Suárez',
    servicio: 'Limpieza facial',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  readonly profesional = 'Juan Nosicoski';

  readonly servicios = [
    'Limpieza facial',
    'Manicura',
    'Masaje relajante',
  ];

  readonly horarios = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  readonly hoy = '2026-07-20';
  readonly ahora = '12:01';

  private readonly reservasSignal = signal<AgendaReserva[]>(this.load());

  readonly reservas = this.reservasSignal.asReadonly();

  ocupado(fecha: string, hora: string): boolean {
    return this.reservasSignal().some(
      (reserva) => reserva.fecha === fecha && reserva.hora === hora,
    );
  }

  agregarReserva(datos: Omit<AgendaReserva, 'id'>): void {
    const reserva: AgendaReserva = { id: Date.now(), ...datos };

    this.update([...this.reservasSignal(), reserva]);
  }

  editarReserva(reserva: AgendaReserva): void {
    this.update(
      this.reservasSignal().map((existente) =>
        existente.id === reserva.id ? reserva : existente,
      ),
    );
  }

  eliminarReserva(id: number): void {
    this.update(
      this.reservasSignal().filter((reserva) => reserva.id !== id),
    );
  }

  private update(reservas: AgendaReserva[]): void {
    this.reservasSignal.set(reservas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
  }

  private load(): AgendaReserva[] {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(RESERVAS_MOCK));
      return RESERVAS_MOCK;
    }

    try {
      const reservas = JSON.parse(stored);

      return Array.isArray(reservas) ? reservas : RESERVAS_MOCK;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return RESERVAS_MOCK;
    }
  }
}
