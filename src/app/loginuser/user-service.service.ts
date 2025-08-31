import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  [x: string]: any;
  constructor(private http: HttpClient) {}

  getUsers(id: number): Observable<User> {
    return this.http
      .get<User>(environment.local.urlApi + 'perfiles/' + id)
      .pipe(catchError(this.handleError));
  }

  updateUsuario(id: Number, formData: FormData): Observable<any> {
    return this.http.put(`${environment.local.urlApi}perfiles/${id}`, formData);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrio un ERROR', error.error);
    } else {
      console.error(
        'Backend Retorno codigo de Error',
        error.status,
        error.message
      );
    }
    return throwError(
      () => new Error('Algo Fallo por favor intente nuevamente')
    );
  }
}
