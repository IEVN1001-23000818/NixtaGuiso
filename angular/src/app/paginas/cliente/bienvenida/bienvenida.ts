import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { marcarBienvenidaVista } from '../../../guards/auth.guards';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.html'
})
export class Bienvenida {

  private router = inject(Router);

  ir(ruta: string): void {
    marcarBienvenidaVista();
    this.router.navigate([ruta]);
  }
}
