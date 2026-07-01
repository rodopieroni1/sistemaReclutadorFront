import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MisAplicacionesServiceService {
  private apiUrl = environment.local.urlApi + '/aplicaciones';
  private apiUrlOfertas = environment.local.urlApi + '/ofertas';

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
  obtenerPerfilPostulaciones(idOferta: number) {
    return this.http.get<any[]>(this.apiUrlOfertas + `/existeId/${idOferta}`);
  }
}
