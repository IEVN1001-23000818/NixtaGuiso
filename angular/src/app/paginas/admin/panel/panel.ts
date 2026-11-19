import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../servicios/auth.service';

// Pantalla temporal: el Panel Operativo se construye en el paso 7
@Component({
  selector: 'app-panel',
  templateUrl: './panel.html'
})
export class Panel {
  auth = inject(AuthService);
  private router = inject(Router);

  cerrarSesion(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
