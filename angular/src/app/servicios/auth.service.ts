import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { DatosRegistro, RespuestaUsuario, Usuario } from '../interfaces/usuario';
import { Respuesta } from '../interfaces/respuesta';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/auth`;

  // Usuario con sesión activa (null = visitante)
  readonly usuario = signal<Usuario | null>(null);

  readonly estaConectado = computed(() => this.usuario() !== null);
  readonly esCliente = computed(() => this.usuario()?.rol === 'cliente');
  readonly esAdmin = computed(() => this.usuario()?.rol === 'admin');
  readonly primerNombre = computed(() => this.usuario()?.nombre.split(' ')[0] ?? '');

  /**
   * Se ejecuta al abrir la aplicación: pregunta a Flask si ya hay sesión.
   * Nunca falla: si no hay sesión, el usuario queda como visitante.
   */
  async cargarSesion(): Promise<void> {
    try {
      const respuesta = await firstValueFrom(this.http.get<RespuestaUsuario>(`${this.api}/yo`));
      this.usuario.set(respuesta.usuario);
    } catch {
      this.usuario.set(null);
    }
  }

  iniciarSesion(correo: string, contrasena: string): Observable<RespuestaUsuario> {
    return this.http
      .post<RespuestaUsuario>(`${this.api}/login`, { correo, contrasena })
      .pipe(tap(respuesta => this.usuario.set(respuesta.usuario)));
  }

  registrar(datos: DatosRegistro): Observable<RespuestaUsuario> {
    return this.http
      .post<RespuestaUsuario>(`${this.api}/registro`, datos)
      .pipe(tap(respuesta => this.usuario.set(respuesta.usuario)));
  }

  cerrarSesion(): Observable<Respuesta> {
    return this.http
      .post<Respuesta>(`${this.api}/logout`, {})
      .pipe(tap(() => this.usuario.set(null)));
  }

  // Actualiza los datos guardados (por ejemplo, después de editar el perfil)
  actualizarUsuario(usuario: Usuario): void {
    this.usuario.set(usuario);
  }

  // Se usa cuando Flask responde que la sesión venció
  limpiar(): void {
    this.usuario.set(null);
  }
}
