import { Respuesta } from './respuesta';

// Respuesta de GET /api/salud
export interface Salud extends Respuesta {
  base_de_datos: string;
  tablas: number;
  productos: number;
}
