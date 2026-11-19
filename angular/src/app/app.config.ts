import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { credencialesInterceptor } from './interceptores/credenciales.interceptor';
import { AuthService } from './servicios/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([credencialesInterceptor])),

    // Antes de mostrar la primera pantalla, revisa si ya hay sesión en Flask
    provideAppInitializer(() => inject(AuthService).cargarSesion())
  ]
};
