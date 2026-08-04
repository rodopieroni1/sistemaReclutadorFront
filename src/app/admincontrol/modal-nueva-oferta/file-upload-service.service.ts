import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  [x: string]: any;
  private uploadUrl = environment.local.urlApi + 'api/uploads/';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  uploadImage(file: File, tipo?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (tipo) {
      formData.append('tipo', tipo);
    }

    return this.http
      .post(this.uploadUrl, formData, {
        observe: 'response',
        responseType: 'json',
      })
      .pipe(
        tap((response) => {
          if (response.status === 200) {
            this.snackBar.open('Archivo subido exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          } else {
            this.snackBar.open('Error al subir el archivo', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          }
        }),
        catchError((error) => {
          console.error('Error al subir el archivo:', error);
          this.snackBar.open(
            'Error crítico al conectar con el servidor',
            'Cerrar',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            },
          );
          return throwError(() => error);
        }),
      );
  }
}
