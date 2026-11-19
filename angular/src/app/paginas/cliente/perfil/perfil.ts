import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../servicios/auth.service';
import { EncabezadoPagina } from '../../../componentes/encabezado-pagina/encabezado-pagina';

// Versión inicial: la edición de datos, ubicación y referidos se agrega en el paso 5
@Component({
  selector: 'app-perfil',
  imports: [EncabezadoPagina],
  templateUrl: './perfil.html'
})
export class Perfil {

  auth = inject(AuthService);
  private router = inject(Router);

  cliente = computed(() => this.auth.usuario()?.cliente);

  insignia = computed(() => {
    const c = this.cliente();
    if (!c) return '';
    return c.tipo === 'B2B' ? `Cuenta de Negocio · Nivel ${c.nivel_b2b}` : 'Cuenta de Hogar';
  });

  cerrarSesion(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }
}
