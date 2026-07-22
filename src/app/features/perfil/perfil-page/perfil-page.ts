import { Component, inject } from '@angular/core';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil-page',
  imports: [],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css',
})
export class PerfilPage {
  private readonly authService = inject(AuthService);

  protected readonly email =
    this.authService.currentUser()?.email ?? 'juanmanosicoski@gmail.com';

  protected readonly id = '547933';
}
