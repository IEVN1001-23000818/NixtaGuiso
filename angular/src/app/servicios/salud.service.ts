import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Salud } from '../interfaces/salud';

@Injectable({
  providedIn: 'root'
})
export class SaludService {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Comprueba que Flask responde y está conectado a MySQL
  revisar(): Observable<Salud> {
    return this.http.get<Salud>(`${this.api}/api/salud`);
  }
}
