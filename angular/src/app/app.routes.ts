import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/prueba-conexion/prueba-conexion').then(m => m.PruebaConexion)
  },
  { path: '**', redirectTo: '' }
];
