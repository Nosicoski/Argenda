import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Completá todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const registered = this.authService.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password
    });

    if (!registered) {
      this.errorMessage =
        'Ya existe una cuenta registrada con ese correo.';
      return;
    }

    this.successMessage =
      'Cuenta creada correctamente. Redirigiendo al inicio de sesión...';

    setTimeout(() => {
      this.router.navigateByUrl('/iniciar-sesion');
    }, 1200);
  }
}