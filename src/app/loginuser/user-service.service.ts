import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { catchError, Observable, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  [x: string]: any;
  constructor(private http: HttpClient) {}

  getUsers(id: number): Observable<User> {
    // 👈 VALIDACIÓN CRÍTICA: Extraemos la URL y verificamos que exista y no sea nula/id
    const baseUrl = environment?.local?.urlApi;
    if (!baseUrl || !id) {
      console.warn(
        'UserService: urlApi o ID no válidos. Evitando petición corrupta.',
        { baseUrl, id },
      );
      return throwError(
        () => new Error('Configuración de API o ID inválidos.'),
      );
    }

    return this.http
      .get<User>(`${baseUrl}perfiles/${id}`) // Usamos template strings para evitar errores de concatenación
      .pipe(catchError(this.handleError));
  }

  updateUsuario(id: number, formData: FormData): Observable<any> {
    const baseUrl = environment?.local?.urlApi;
    if (!baseUrl || !id) {
      return throwError(
        () => new Error('Configuración de API o ID inválidos.'),
      );
    }

    return this.http
      .put(`${baseUrl}perfiles/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrio un ERROR de red o URL inválida:', error.error);
    } else {
      console.error(
        'Backend Retorno codigo de Error',
        error.status,
        error.message,
      );
    }
    return throwError(
      () => new Error('Algo Fallo por favor intente nuevamente'),
    );
  }
}
