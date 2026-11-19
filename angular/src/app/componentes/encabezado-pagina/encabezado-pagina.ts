import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Encabezado naranja de las pantallas (estilo de los maquetados).
 * Uso: <app-encabezado-pagina titulo="Mi Carrito" subtitulo="..." [regresar]="true" />
 */
@Component({
  selector: 'app-encabezado-pagina',
  templateUrl: './encabezado-pagina.html'
})
export class EncabezadoPagina {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  regresar = input<boolean>(false);

  private location = inject(Location);

  volver(): void {
    this.location.back();
  }
}
