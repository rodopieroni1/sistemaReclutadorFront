import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultadoAplicacion } from './resultado-aplicaciones.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

export interface AplicacionResponse {
  status: ResultadoAplicacion;
  mensaje: string;
}
@Injectable({
  providedIn: 'root',
})
export class AplicacionServiceService {
  private apiUrl = environment.local.urlApi + '/aplicaciones'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) {}

  aplicar(idOferta: number, idPerfil: number): Observable<ResultadoAplicacion> {
    const body = {
      id_oferta: {
        idOferta: idOferta,
      },
      id_perfil: {
        id_perfil: idPerfil,
      },
    };
    console.log(JSON.stringify(body));
    return this.http.post<ResultadoAplicacion>(this.apiUrl, body, {
      responseType: 'json',
    });
  }
}
