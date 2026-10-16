import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModificarPasswordUsuarioServiceService {
  constructor(private http: HttpClient) {}

cambiarPassword(datos: { password: string }) {
  const token = sessionStorage.getItem('usuarioToken');

  return this.http.put(
    `${environment.local.urlApi}/usuarios/contrasena-admin`,
    datos,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
}
