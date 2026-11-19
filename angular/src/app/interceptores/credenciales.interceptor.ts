import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../servicios/auth.service';

/**
 * 1. Agrega "withCredentials: true" para que viaje la cookie de sesión de Flask.
 * 2. Si Flask responde 401 (sesión vencida), lleva al usuario a iniciar sesión.
 */
export const credencialesInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRutaDeSesion = req.url.includes('/api/auth/');

      if (error.status === 401 && !esRutaDeSesion) {
        auth.limpiar();
        router.navigate(['/login'], { queryParams: { volver: router.url } });
      }
      return throwError(() => error);
    })
  );
};
