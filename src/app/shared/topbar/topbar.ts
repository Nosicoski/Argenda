import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  protected readonly navItems = [
    { label: 'Agenda', active: true },
    { label: 'Ventas', active: false },
    { label: 'Pacientes', active: false },
    { label: 'Reportes', active: false },
    { label: 'Administración', active: false },
  ];
}
