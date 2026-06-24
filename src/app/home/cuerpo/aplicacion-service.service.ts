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
      idOferta: { idOferta },
      idPerfil: { id_perfil: idPerfil },
    };
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
      next: (response: ResultadoAplicacion) => {
        if (response === ResultadoAplicacion.APLICACION_CREADA) {
          this.snackBar.open(
            `Acabas de aplicar para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 6000 },
          );
        }
        if (response === ResultadoAplicacion.YA_APLICO) {
          this.snackBar.open(
            `Ya aplicaste para la oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 4000 },
          );
        }
        if (response === ResultadoAplicacion.ACTUALIZACION_ESTADO) {
          this.snackBar.open(
            `Se actualizo el estado en esta oferta: ${nombreOferta}`,
            'Cerrar',
            { duration: 4000 },
          );
        }
        alFinalizar();
      },
      error: (error) => {
        console.error('ERROR COMPLETO', error);

        this.snackBar.open(
          'Tu sesión expiró. Volvé a iniciar sesión.',
          'Cerrar',
          { duration: 5000 },
        );
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
