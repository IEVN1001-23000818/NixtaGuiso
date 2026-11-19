import { Component, OnInit, inject, signal } from '@angular/core';

import { SaludService } from '../../servicios/salud.service';
import { Salud } from '../../interfaces/salud';

@Component({
  selector: 'app-prueba-conexion',
  templateUrl: './prueba-conexion.html'
})
export class PruebaConexion implements OnInit {

  private saludService = inject(SaludService);

  cargando = signal(true);
  salud = signal<Salud | null>(null);
  error = signal('');

  colores = [
    { nombre: 'Naranja', clase: 'bg-nixta-naranja', hex: '#F5AF41' },
    { nombre: 'Crema', clase: 'bg-nixta-crema', hex: '#EFEDD2' },
    { nombre: 'Verde', clase: 'bg-nixta-verde', hex: '#10733B' },
    { nombre: 'Café', clase: 'bg-nixta-cafe', hex: '#593936' },
    { nombre: 'Dorado', clase: 'bg-nixta-dorado', hex: '#C08E46' },
    { nombre: 'Amarillo', clase: 'bg-nixta-amarillo', hex: '#F8E330' }
  ];

  ngOnInit(): void {
    this.revisarConexion();
  }

  revisarConexion(): void {
    this.cargando.set(true);
    this.error.set('');

    this.saludService.revisar().subscribe({
      next: (respuesta) => {
        this.salud.set(respuesta);
        this.cargando.set(false);
      },
      error: (err) => {
        // status 0 = Flask apagado o bloqueado por CORS
        this.error.set(
          err.status === 0
            ? 'No hay conexión con Flask. Revisa que esté corriendo en http://localhost:5000'
            : (err.error?.mensaje || 'Error al conectar con Flask')
        );
        this.cargando.set(false);
      }
    });
  }
}
