import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MisAplicacionesServiceService {
  private apiUrl = 'http://localhost:8080/aplicaciones';
  constructor(private http: HttpClient) {}

  obtenerPostulaciones(idPerfil: number) {
    return this.http.get<any[]>(this.apiUrl + `/perfil/${idPerfil}`);
  }

  actualizarPostulacionesEstado(idPost: number, estado: boolean) {
    console.log('Actualizando postulacion con id:', idPost, 'Datos:', estado);
    return this.http.patch<any[]>(this.apiUrl + `/estado/${idPost}`, {
      estado,
    });
  }
}
