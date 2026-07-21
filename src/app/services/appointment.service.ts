import { Injectable, signal } from '@angular/core';

export interface AgendaReserva {
  fecha: string;
  hora: string;
  cliente: string;
  servicio: string;
}

/**
 * Datos mockeados de la agenda (solo diseño).
 * Compartidos entre el panel de agenda y el flujo público de reserva
 * para que la disponibilidad se vea sincronizada.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  readonly profesional = 'Juan Nosicoski';

  // Horarios de atención (coinciden con la grilla de la agenda)
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
    '19:00'
  ];

  // "Hoy" mockeado, igual que la agenda
  readonly hoy = '2026-07-20';
  readonly ahora = '12:01';

  private readonly reservasSignal = signal<AgendaReserva[]>([
    {
      fecha: '2026-07-20',
      hora: '10:00',
      cliente: 'María González',
      servicio: 'Corte y peinado'
    },
    {
      fecha: '2026-07-22',
      hora: '15:00',
      cliente: 'Lucas Fernández',
      servicio: 'Coloración'
    }
  ]);

  readonly reservas = this.reservasSignal.asReadonly();

  ocupado(fecha: string, hora: string): boolean {
    return this.reservasSignal().some(
      reserva => reserva.fecha === fecha && reserva.hora === hora
    );
  }

  agregarReserva(reserva: AgendaReserva): void {
    this.reservasSignal.update(
      reservas => [...reservas, reserva]
    );
  }
}
