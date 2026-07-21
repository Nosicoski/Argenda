import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { Topbar } from './shared/topbar/topbar';
import { Navbar } from './components/navbar/navbar';

const PUBLIC_PREFIXES = [
  '/inicio',
  '/servicios',
  '/reservar',
  '/registro',
  '/iniciar-sesion',
  '/mis-turnos',
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Topbar,
    Navbar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private url = signal(this.router.url);

  readonly isPublic = computed(() =>
    PUBLIC_PREFIXES.some((prefix) => this.url().startsWith(prefix))
  );

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.url.set(this.router.url));
  }
}
