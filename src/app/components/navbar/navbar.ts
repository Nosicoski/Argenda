import { Component } from '@angular/core';
import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  menuOpen = false;
  profileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  // =========================
  // Menú principal
  // =========================

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  // =========================
  // Menú del usuario
  // =========================

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
    this.menuOpen = false;
  }

  // =========================
  // Cerrar sesión
  // =========================

  logout(): void {
    this.authService.logout();

    this.profileMenuOpen = false;
    this.menuOpen = false;

    this.router.navigate(['/']);
  }

  // =========================
  // Nombre del usuario
  // =========================

  get userName(): string {
    const fullName =
      this.authService.currentUser()?.name ?? 'Usuario';

    const firstName = fullName.trim().split(' ')[0];

    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }
}