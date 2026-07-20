import { Component } from '@angular/core';

@Component({
  selector: 'app-agenda-calendar',
  templateUrl: './agenda-calendar.html',
  styleUrl: './agenda-calendar.css',
})
export class AgendaCalendar {
  protected readonly days = [
    { label: 'Lunes 13/07', today: false },
    { label: 'Martes 14/07', today: false },
    { label: 'Miércoles 15/07', today: false },
    { label: 'Jueves 16/07', today: true },
    { label: 'Viernes 17/07', today: false },
    { label: 'Sábado 18/07', today: false },
    { label: 'Domingo 19/07', today: false },
  ];

  protected readonly hours = [
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
  ];

  // Alto de cada fila de hora en px (debe coincidir con .arg-hour-row del CSS)
  protected readonly rowHeight = 36;

  // Posición de la línea de hora actual: 12:01 → 3 filas completas + 1 minuto
  protected readonly nowLabel = '12:01';
  protected readonly nowOffsetRows = 3 + 1 / 60;
}
