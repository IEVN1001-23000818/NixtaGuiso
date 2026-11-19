import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../servicios/auth.service';
import { DatosRegistro } from '../../../interfaces/usuario';
import { marcarBienvenidaVista } from '../../../guards/auth.guards';

// Las mismas reglas que valida Flask
const PATRON_TELEFONO = /^[0-9]{10}$/;
const PATRON_RFC = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i;

/** Valida que "confirmar" sea igual a "contrasena". */
function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
  const contrasena = grupo.get('contrasena')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return contrasena && confirmar && contrasena !== confirmar ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class Registro {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  enviando = signal(false);
  error = signal('');
  verContrasena = signal(false);

  formulario = this.fb.nonNullable.group({
    tipo: ['B2C' as 'B2C' | 'B2B', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO)]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmar: ['', Validators.required],
    nombre_negocio: [''],
    rfc: ['', Validators.pattern(PATRON_RFC)],
    direccion: [''],
    codigo_invitacion: ['']
  }, { validators: contrasenasIguales });

  constructor() {
    // El nombre del negocio solo es obligatorio para cuentas Negocio
    this.formulario.controls.tipo.valueChanges.subscribe(tipo => {
      const negocio = this.formulario.controls.nombre_negocio;
      negocio.setValidators(tipo === 'B2B' ? [Validators.required, Validators.minLength(3)] : []);
      negocio.updateValueAndValidity();
    });
  }

  get esNegocio(): boolean {
    return this.formulario.controls.tipo.value === 'B2B';
  }

  invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  get contrasenasDiferentes(): boolean {
    return this.formulario.hasError('noCoinciden') && this.formulario.controls.confirmar.touched;
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const f = this.formulario.getRawValue();
    const datos: DatosRegistro = {
      nombre: f.nombre.trim(),
      correo: f.correo.trim(),
      telefono: f.telefono.trim(),
      contrasena: f.contrasena,
      tipo: f.tipo,
      direccion: f.direccion.trim() || undefined,
      codigo_invitacion: f.codigo_invitacion.trim() || undefined
    };
    if (f.tipo === 'B2B') {
      datos.nombre_negocio = f.nombre_negocio.trim();
      datos.rfc = f.rfc.trim().toUpperCase() || undefined;
    }

    this.enviando.set(true);
    this.error.set('');

    this.auth.registrar(datos).subscribe({
      next: () => {
        marcarBienvenidaVista();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudo conectar con el servidor');
        this.enviando.set(false);
      }
    });
  }
}
