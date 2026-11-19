import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../servicios/auth.service';
import { marcarBienvenidaVista } from '../../../guards/auth.guards';

@Component({
  selector: 'app-iniciar-sesion',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html'
})
export class IniciarSesion {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Viene de la URL: /login?volver=/carrito
  volver = input<string>('');

  enviando = signal(false);
  error = signal('');
  verContrasena = signal(false);

  formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required]
  });

  invalido(campo: 'correo' | 'contrasena'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    const { correo, contrasena } = this.formulario.getRawValue();

    this.auth.iniciarSesion(correo, contrasena).subscribe({
      next: (respuesta) => {
        marcarBienvenidaVista();
        if (respuesta.usuario.rol === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.volver() || '/');
        }
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudo conectar con el servidor');
        this.enviando.set(false);
      }
    });
  }
}
