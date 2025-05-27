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
  userProfileImage: string | undefined;
  currentPerfilId!: number | 0;

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

          let nombreRec = sessionStorage.getItem('userName');
          this.http
            .get(`http://localhost:8080/perfiles/name/${nombreRec}`, {
              responseType: 'text',
            })
            .subscribe({
              next: (urlData) => {
                this.currentUserLoginOn.next(true);
                this.currentUserProfileImage.next(urlData); // Fuerza la actualización del estado
                this.currentUserData.next(userData.token);
                this.currentUserNombre.next(userData.nombre); // Actualiza el nombre del usuario

                sessionStorage.setItem(
                  'userProfileImage',
                  this.currentUserProfileImage.value
                );
              },
              error: (err) => console.error('Error en la petición:', err),
            });

          this.http
            .get(`http://localhost:8080/perfiles/id/${nombreRec}`)
            .subscribe({
              next: (userData: any) => {
                const idPerfil = userData.id_perfil; // Asegúrate de que la estructura es correcta

                console.log('userData:', userData);

                console.log('IDPERFIL almacenado:', idPerfil);

                if (idPerfil) {
                  sessionStorage.setItem('id_perfil', idPerfil.toString());
                  console.log('IDPERFIL almacenado:', idPerfil);
                } else {
                  console.error('IDPERFIL no encontrado en la respuesta.');
                }
              },
              error: (err) => console.error('Error en la peticiónID:', err),
            });
        }),
        map((userData) => userData.token),
        catchError(this.handleError)
      );
  }

  refreshComponent() {
    this.userProfileImage = ''; // Borrar la imagen temporalmente
    setTimeout(() => {
      this.userProfileImage =
        sessionStorage.getItem('userProfileImage') + '?' + new Date().getTime();
      console.log('FotoImprecionLog2', this.userProfileImage);

      this.userProfileImage =
        sessionStorage.getItem(this.userProfileImage) +
        '?' +
        new Date().getTime();
    }, 50);
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
