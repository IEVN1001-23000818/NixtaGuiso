import { Respuesta } from './respuesta';

// Datos de compra del cliente (no existen para el administrador)
export interface Cliente {
  id_cliente: number;
  tipo: 'B2C' | 'B2B';
  nombre_negocio: string | null;
  rfc: string | null;
  nivel_b2b: number | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  codigo_referido: string;
  saldo_favor: number;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  rol: 'cliente' | 'admin';
  cliente?: Cliente;
}

// Respuesta de login, registro y /api/auth/yo
export interface RespuestaUsuario extends Respuesta {
  usuario: Usuario;
}

// Datos que se envían al registrarse
export interface DatosRegistro {
  nombre: string;
  correo: string;
  telefono: string;
  contrasena: string;
  tipo: 'B2C' | 'B2B';
  nombre_negocio?: string;
  rfc?: string;
  direccion?: string;
  codigo_invitacion?: string;
  latitud?: number;
  longitud?: number;
}
