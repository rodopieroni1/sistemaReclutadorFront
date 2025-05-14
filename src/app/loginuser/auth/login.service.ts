import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from './loginRequest';
import {
  catchError,
  Observable,
  throwError,
  BehaviorSubject,
  tap,
  map,
} from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  currentUserData: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentUserNombre: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentUserProfileImage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
    this.currentUserLoginOn = new BehaviorSubject<boolean>(
      sessionStorage.getItem('token') != null
    );
    this.currentUserData = new BehaviorSubject<string>(
      sessionStorage.getItem('token') || ''
    );
  }

  login(credential: LoginRequest): Observable<any> {
    return this.http
      .post<any>(
        environment.local.urlHost + 'perfiles/auth/login',
        credential,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        tap((userData: any) => {
          sessionStorage.setItem('token', userData.token); // Guarda el token en sessionStorage
          sessionStorage.setItem('userName', credential.clave); // Guarda el nombre en sessionStorage

          this.currentUserData.next(userData.token);
          this.currentUserLoginOn.next(true);
          this.currentUserNombre.next(userData.nombre); // Actualiza el nombre del usuario
          // this.currentUserProfileImage.next(userData.imagen);
          let nombreRec = sessionStorage.getItem('userName');
          this.http
            .get(`http://localhost:8080/perfiles/name/${nombreRec}`, {
              responseType: 'text',
            })
            .subscribe({
              next: (urlData) => {
                console.log('Respuesta del servidor:', urlData);
                sessionStorage.setItem('userProfileImage', urlData);
              },
              error: (err) => console.error('Error en la petición:', err),
            });
        }),
        map((userData) => userData.token),
        catchError(this.handleError)
      );
  }
  getUserName(): Observable<string> {
    console.log('Login activado:', true);
    this.currentUserLoginOn.next(true);
    const userData = sessionStorage.getItem('userName') || 1;
    return this.currentUserNombre.asObservable();
  }

  logout() {
    sessionStorage.removeItem('token');
    this.currentUserLoginOn.next(false);
    this.currentUserData.next('');
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrio un ERROR', error.error);
    } else {
      console.error(
        'Backend Retorno codigo de Error',
        error.status,
        error.error
      );
    }
    return throwError(
      () => new Error('Algo Fallo por favor intente nuevamente', error.error)
    );
  }

  getUserData(): Observable<String> {
    return this.currentUserData.asObservable();
  }

  getLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }
}

/*function tap(
  arg0: (userData: User) => void
): import('rxjs').OperatorFunction<User, User> {
  throw new Error('Function not implemented.');
}*/
