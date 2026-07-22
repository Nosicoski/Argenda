import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavChild {
  label: string;
  link: string | null;
}

interface NavItem {
  label: string;
  link: string | null;
  menu: boolean;
  children: NavChild[];
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly router = inject(Router);

  // Menú desplegable abierto (por etiqueta del item)
  protected readonly openMenu = signal<string | null>(null);

  protected readonly navItems: NavItem[] = [
    {
      label: 'Agenda',
      link: '/agenda',
      menu: false,
      children: [],
    },
    {
      label: 'Ventas',
      link: null,
      menu: true,
      children: [
        { label: 'Detalle de ventas', link: null },
        { label: 'Transacciones', link: null },
        { label: 'Caja de ventas', link: null },
        { label: 'Mis pagos', link: null },
        { label: 'Mis cobros', link: null },
      ],
    },
    {
      label: 'Pacientes',
      link: null,
      menu: true,
      children: [
        { label: 'Base de pacientes', link: '/pacientes' },
        { label: 'Recordatorios', link: null },
        { label: 'Emails', link: null },
      ],
    },
    {
      label: 'Reportes',
      link: null,
      menu: true,
      children: [],
    },
    {
      label: 'Administración',
      link: null,
      menu: true,
      children: [
        { label: 'Perfil', link: null },
        { label: 'Profesionales', link: '/profesionales' },
        { label: 'WhatsApp', link: null },
        { label: 'Planes', link: null },
      ],
    },
  ];

  protected toggleMenu(label: string): void {
    this.openMenu.update((open) => (open === label ? null : label));
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  // Un item con submenú queda activo si alguna de sus rutas está abierta
  protected isSectionActive(item: NavItem): boolean {
    return item.children.some(
      (child) => child.link !== null && this.router.url.startsWith(child.link),
    );
  }
}
