import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../servicios/auth.service';

const CLAVE_BIENVENIDA = 'nixta_bienvenida_vista';

/** Solo clientes con sesión (carrito, pedidos, perfil...). */
export const clienteGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esCliente()) return true;
  if (auth.esAdmin()) return router.createUrlTree(['/admin']);

  // Visitante: al iniciar sesión regresará a donde quería ir
  return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Solo el administrador (panel). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return true;
  if (auth.esCliente()) return router.createUrlTree(['/']);
  return router.createUrlTree(['/login']);
};

/** Login, registro y bienvenida: si ya hay sesión, no tiene caso mostrarlos. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdmin()) return router.createUrlTree(['/admin']);
  if (auth.esCliente()) return router.createUrlTree(['/']);
  return true;
};

/** La primera vez que un visitante abre la app, ve la pantalla de bienvenida. */
export const bienvenidaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaConectado() || bienvenidaVista()) return true;
  return router.createUrlTree(['/bienvenida']);
};

export function bienvenidaVista(): boolean {
  try {
    return localStorage.getItem(CLAVE_BIENVENIDA) === 'si';
  } catch {
    return true;
  }
}

export function marcarBienvenidaVista(): void {
  try {
    localStorage.setItem(CLAVE_BIENVENIDA, 'si');
  } catch {
    // Si el navegador no permite guardar, simplemente no se recuerda
  }
}
