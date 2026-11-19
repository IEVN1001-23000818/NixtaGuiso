import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-layout-cliente',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-cliente.html'
})
export class LayoutCliente {

  auth = inject(AuthService);
  private router = inject(Router);

  // Opciones de la barra inferior (celular) y del menú superior (computadora)
  menu = [
    { ruta: '/', icono: 'home', texto: 'Inicio', exacta: true },
    { ruta: '/carrito', icono: 'shopping_cart', texto: 'Carrito', exacta: false },
    { ruta: '/pedidos', icono: 'schedule', texto: 'Pedidos', exacta: false },
    { ruta: '/perfil', icono: 'person', texto: 'Perfil', exacta: false }
  ];

  cerrarSesion(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }
}
