import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  [x: string]: any;
  private uploadUrl = 'http://localhost:8080/api/uploads/';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post(this.uploadUrl, formData, {
        observe: 'response', // Con esto obtenés un HttpResponse completo
        responseType: 'json',
      }) // Cambio aquí
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
          return throwError(() => error);
        })
      );
  }
}
