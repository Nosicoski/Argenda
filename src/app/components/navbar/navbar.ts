import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

get userName(): string {
  const fullName =
    this.authService.currentUser()?.name ?? 'Usuario';

  const firstName = fullName.trim().split(' ')[0];

  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }
}