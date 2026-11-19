import { Routes } from '@angular/router';

import { adminGuard, bienvenidaGuard, clienteGuard, invitadoGuard } from './guards/auth.guards';

export const routes: Routes = [

  // ---------- Pantallas sin marco (pantalla completa) ----------
  {
    path: 'bienvenida',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./paginas/cliente/bienvenida/bienvenida').then(m => m.Bienvenida)
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./paginas/cliente/iniciar-sesion/iniciar-sesion').then(m => m.IniciarSesion)
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./paginas/cliente/registro/registro').then(m => m.Registro)
  },
  {
    path: 'prueba',
    loadComponent: () => import('./paginas/prueba-conexion/prueba-conexion').then(m => m.PruebaConexion)
  },

  // ---------- Panel administrativo (se completa en el paso 7) ----------
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./paginas/admin/panel/panel').then(m => m.Panel)
  },

  // ---------- Área del cliente (con encabezado y barra inferior) ----------
  {
    path: '',
    loadComponent: () => import('./layouts/layout-cliente/layout-cliente').then(m => m.LayoutCliente),
    children: [
      {
        path: '',
        canActivate: [bienvenidaGuard],
        loadComponent: () => import('./paginas/cliente/inicio/inicio').then(m => m.Inicio)
      },
      {
        path: 'carrito',
        canActivate: [clienteGuard],
        loadComponent: () => import('./paginas/cliente/carrito/carrito').then(m => m.Carrito)
      },
      {
        path: 'pedidos',
        canActivate: [clienteGuard],
        loadComponent: () => import('./paginas/cliente/mis-pedidos/mis-pedidos').then(m => m.MisPedidos)
      },
      {
        path: 'perfil',
        canActivate: [clienteGuard],
        loadComponent: () => import('./paginas/cliente/perfil/perfil').then(m => m.Perfil)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
