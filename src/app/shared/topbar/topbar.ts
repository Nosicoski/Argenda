import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  protected readonly navItems = [
    { label: 'Agenda', active: true, menu: false },
    { label: 'Ventas', active: false, menu: true },
    { label: 'Pacientes', active: false, menu: true },
    { label: 'Reportes', active: false, menu: true },
    { label: 'Administración', active: false, menu: true },
  ];
}
