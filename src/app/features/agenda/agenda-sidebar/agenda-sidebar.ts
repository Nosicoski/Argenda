import { Component } from '@angular/core';

interface MiniCalendarDay {
  day: number;
  muted: boolean;
  today: boolean;
}

interface MiniCalendarMonth {
  title: string;
  weeks: MiniCalendarDay[][];
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function buildMonth(title: string, cells: number[][], currentDay?: number): MiniCalendarMonth {
  return {
    title,
    weeks: cells.map((week, weekIndex) =>
      week.map((day) => ({
        day,
        // números grandes en la primera semana o pequeños en la última pertenecen al mes vecino
        muted:
          (weekIndex === 0 && day > 7) || (weekIndex === cells.length - 1 && day <= 14 && week[0] > 14),
        today: day === currentDay && !(weekIndex === 0 && day > 7),
      })),
    ),
  };
}

@Component({
  selector: 'app-agenda-sidebar',
  templateUrl: './agenda-sidebar.html',
  styleUrl: './agenda-sidebar.css',
})
export class AgendaSidebar {
  protected readonly weekdays = WEEKDAYS;

  protected readonly months: MiniCalendarMonth[] = [
    buildMonth(
      'Julio 2026',
      [
        [29, 30, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, 31, 1, 2],
      ],
      16,
    ),
    buildMonth('Agosto 2026', [
      [27, 28, 29, 30, 31, 1, 2],
      [3, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16],
      [17, 18, 19, 20, 21, 22, 23],
      [24, 25, 26, 27, 28, 29, 30],
      [31, 1, 2, 3, 4, 5, 6],
    ]),
  ];
}
