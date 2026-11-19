import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../servicios/auth.service';

// Pantalla temporal: el catálogo completo se construye en el paso 3
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class Inicio {
  auth = inject(AuthService);

  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buen día';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get tarifa(): string {
    const cliente = this.auth.usuario()?.cliente;
    if (!cliente || cliente.tipo === 'B2C') return 'Precios de Hogar';
    return `Precios de Negocio nivel ${cliente.nivel_b2b}`;
  }
}
