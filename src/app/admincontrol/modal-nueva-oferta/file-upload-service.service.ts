import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private uploadUrl = 'http://localhost:8080/api/uploads'; // URL del endpoint del backend

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Archivo que se envía:', file.name);
    console.log('URL de carga:', this.uploadUrl);

    return this.http
      .post(this.uploadUrl, formData, { observe: 'response' })
      .pipe(
        tap((response) => console.log('Respuesta del servidor:', response)),
        catchError((error) => {
          console.error('Error al subir el archivo:', error);
          return throwError(error);
        })
      );
  }
}
