import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Ingresá tu correo y contraseña.';
      return;
    }

    const loggedIn = this.authService.login(
      this.email.trim(),
      this.password
    );

    if (!loggedIn) {
      this.errorMessage = 'Correo o contraseña incorrectos.';
      return;
    }

    this.router.navigateByUrl('/reservar');
  }
}
