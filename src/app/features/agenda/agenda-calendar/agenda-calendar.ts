import { Component, computed, inject, signal } from '@angular/core';
import { NuevaReservaModal } from '../nueva-reserva-modal/nueva-reserva-modal';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-agenda-calendar',
  imports: [NuevaReservaModal],
  templateUrl: './agenda-calendar.html',
  styleUrl: './agenda-calendar.css',
})
export class AgendaCalendar {
  private readonly agenda = inject(AppointmentService);

  protected readonly days = [
    { label: 'Lunes 20/07', fecha: '2026-07-20', today: true, off: false },
    { label: 'Martes 21/07', fecha: '2026-07-21', today: false, off: false },
    { label: 'Miércoles 22/07', fecha: '2026-07-22', today: false, off: false },
    { label: 'Jueves 23/07', fecha: '2026-07-23', today: false, off: false },
    { label: 'Viernes 24/07', fecha: '2026-07-24', today: false, off: false },
    { label: 'Sábado 25/07', fecha: '2026-07-25', today: false, off: false },
    { label: 'Domingo 26/07', fecha: '2026-07-26', today: false, off: true },
  ];

  protected readonly hours = this.agenda.horarios;

  // Alto de cada fila de hora en px (debe coincidir con .arg-hour-row del CSS)
  protected readonly rowHeight = 36;

  // Reservas compartidas con el flujo de reserva (mock, solo diseño)
  protected reservaEn(day: number, hour: number) {
    return (
      this.agenda
        .reservas()
        .find(
          (reserva) =>
            reserva.fecha === this.days[day].fecha &&
            reserva.hora === this.hours[hour],
        ) ?? null
    );
  }

  // Posición de la línea de hora actual: 12:01 → 3 filas completas + 1 minuto
  protected readonly nowLabel = '12:01';
  protected readonly nowOffsetRows = 3 + 1 / 60;

  // Celda seleccionada para agendar (solo diseño)
  protected readonly selected = signal<{ day: number; hour: number } | null>(null);
  protected readonly menuOpen = signal(false);
  protected readonly reservaOpen = signal(false);

  // Fecha y hora de la celda seleccionada, para el modal
  protected readonly selectedFecha = computed(() => {
    const sel = this.selected();
    if (!sel) return 'Lunes, 20 de julio de 2026';
    const [name, dm] = this.days[sel.day].label.split(' ');
    return `${name}, ${dm.split('/')[0]} de julio de 2026`;
  });

  protected readonly selectedHora = computed(() => {
    const sel = this.selected();
    return sel ? this.hours[sel.hour] : '13:00';
  });

  protected selectCell(hour: number, day: number): void {
    if (this.days[day].off) return;
    this.selected.set({ day, hour });
    this.menuOpen.set(true);
  }

  protected clearSelection(): void {
    this.selected.set(null);
    this.menuOpen.set(false);
  }

  protected openReserva(): void {
    this.menuOpen.set(false);
    this.reservaOpen.set(true);
  }

  protected closeReserva(): void {
    this.reservaOpen.set(false);
    this.clearSelection();
  }
}
