import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AplicacionServiceService {
  private apiUrl = 'http://localhost:8080/aplicaciones'; // Ajusta la URL según tu backend
  constructor(private http: HttpClient) {}
  aplicar(idOferta: number, idPerfil: number) {
    const aplicacion = {
      fechaAplicacion: new Date().toISOString(),
      estadoaplicaciones: true,
      id_oferta: { idOferta: idOferta }, // Estructura compatible con OfertaRequest
      id_perfil: { id_perfil: idPerfil }, // Estructura compatible con PerfilSignupRequest
    };
    return this.http.post(this.apiUrl, aplicacion);
  }
}
