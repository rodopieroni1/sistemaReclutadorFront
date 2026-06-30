import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultadoAplicacion } from './resultado-aplicaciones.enum';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AplicacionServiceService {
  private apiUrl = 'http://localhost:8080/aplicaciones'; // Ajusta la URL según tu backend

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  postAplicar(
    idOferta: number,
    idPerfil: number,
  ): Observable<ResultadoAplicacion> {
    const token = sessionStorage.getItem('token');

    const body = {
      // 1. "id_oferta" coincide con @JsonProperty("id_oferta") en AplicacionRequest
      // 2. "idOferta" interno coincide con la variable idOferta en Oferta.java
      id_oferta: { idOferta: idOferta },

      // 1. "id_perfil" coincide con @JsonProperty("id_perfil") en AplicacionRequest
      // 2. "id_perfil" interno coincide con la variable id_perfil en Perfil.java
      id_perfil: { id_perfil: idPerfil },

      estadoaplicaciones: true,
      fechaAplicacion: new Date().toISOString(),
    };
    console.log('Cuerpo de la solicitud POST:', body); // Log del cuerpo de la solicitud
    return this.http.post<ResultadoAplicacion>(this.apiUrl, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  procesarPostulacion(
    idOferta: number,
    idPerfil: number,
    nombreOferta: string,
    alFinalizar: () => void,
  ): void {
    this.postAplicar(idOferta, idPerfil).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);

        // Evaluamos comparando con el Enum de Angular que mapea el string del Backend
        if (response && response.status === ResultadoAplicacion.YA_APLICO) {
          this.snackBar.open(
            `Ya aplicaste para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 4000 },
          );
        } else if (
          response &&
          response.status === ResultadoAplicacion.ACTUALIZACION_ESTADO
        ) {
          this.snackBar.open(
            `Se reactivó tu solicitud para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 5000 },
          );
        } else if (
          response &&
          response.status === ResultadoAplicacion.APLICACION_CREADA
        ) {
          this.snackBar.open(
            `Acabas de aplicar para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 6000 },
          );
        } else {
          this.snackBar.open(
            `Se procesó tu solicitud para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 4000 },
          );
        }
        alFinalizar();
      },
      error: (error) => {
        console.error('ERROR COMPLETO', error);
        this.snackBar.open(
          'Hubo un problema al procesar la solicitud o tu sesión expiró.',
          'Cerrar',
          { duration: 5000 },
        );
        alFinalizar();
      },
    });
  }

  aplicar(idOferta: number, idPerfil: number): Observable<ResultadoAplicacion> {
    const body = {
      idOferta: { idOferta: idOferta },
      idPerfil: { id_perfil: idPerfil },
    };

    return this.http.post<ResultadoAplicacion>(this.apiUrl, body, {
      responseType: 'json',
    });
  }
}
