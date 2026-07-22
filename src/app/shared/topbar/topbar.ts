import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

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

interface ProfileMenuItem {
  label: string;
  icon: string;
  accent: boolean;
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Menú desplegable abierto (por etiqueta del item)
  protected readonly openMenu = signal<string | null>(null);

  protected readonly profileOpen = signal(false);

  protected readonly profileEmail =
    this.authService.currentUser()?.email ?? 'juanmanosicoski@gmail.com';

  protected readonly profileId = '547933';

  protected readonly profileItems: ProfileMenuItem[] = [
    { label: 'Primeros pasos', icon: 'bi-check2-circle', accent: false },
    { label: 'Mis Descargas', icon: 'bi-download', accent: false },
    { label: 'Mis Tickets', icon: 'bi-journal-text', accent: false },
    { label: 'Mis Formularios', icon: 'bi-card-checklist', accent: false },
    { label: 'Invita y gana', icon: 'bi-gift', accent: true },
    { label: 'Academia Argenda', icon: 'bi-play-btn', accent: false },
    { label: 'Pagar', icon: 'bi-currency-dollar', accent: false },
  ];

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
        { label: 'Perfil', link: '/perfil' },
        { label: 'Profesionales', link: '/profesionales' },
        { label: 'WhatsApp', link: null },
        { label: 'Planes', link: null },
      ],
    },
  ];

  protected toggleMenu(label: string): void {
    this.openMenu.update((open) => (open === label ? null : label));
    this.profileOpen.set(false);
  }

  protected closeMenu(): void {
    this.openMenu.set(null);
  }

  protected toggleProfile(): void {
    this.profileOpen.update((open) => !open);
    this.openMenu.set(null);
  }

  protected closeProfile(): void {
    this.profileOpen.set(false);
  }

  protected cerrarSesion(): void {
    this.authService.logout();
    this.closeProfile();
    this.router.navigate(['/iniciar-sesion']);
  }

  // Un item con submenú queda activo si alguna de sus rutas está abierta
  protected isSectionActive(item: NavItem): boolean {
    return item.children.some(
      (child) => child.link !== null && this.router.url.startsWith(child.link),
    );
  }
}
