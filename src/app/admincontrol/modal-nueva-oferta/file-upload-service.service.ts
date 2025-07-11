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
        responseType: 'text',
      }) // Cambio aquí
      .pipe(
        tap((response) => {
          console.log('Status:', response.status);
          console.log('Body:', response.body);
        }),
        catchError((error) => {
          console.error('Error al subir el archivo:', error);
          return throwError(() => error);
        })
      );
  }
}
