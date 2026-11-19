import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Agrega "withCredentials: true" a todas las peticiones.
 * Así el navegador envía la cookie de sesión de Flask (login).
 */
export const credencialesInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
