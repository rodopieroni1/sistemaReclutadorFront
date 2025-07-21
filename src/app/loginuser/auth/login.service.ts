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
    const token = sessionStorage.getItem('token');
    const userName = sessionStorage.getItem('userName');
    const imageUrl = sessionStorage.getItem('userProfileImage');

    this.currentUserLoginOn = new BehaviorSubject<boolean>(!!token);
    this.currentUserData = new BehaviorSubject<string>(token || '');
    this.currentUserNombre = new BehaviorSubject<string>(userName || '');
    this.currentUserProfileImage = new BehaviorSubject<string>(
      imageUrl ? `${imageUrl}?${Date.now()}` : ''
    );
  }

  login(credential: LoginRequest): Observable<any> {
    console.log('CRDENCIALES:', credential.clave, credential.password);

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
              next: (data) => {
                // If the backend returns a JSON string, parse it:
                try {
                  const parsedData = JSON.parse(data);
                  sessionStorage.setItem('userName', parsedData.clave);
                  sessionStorage.setItem(
                    'userProfileImage',
                    parsedData.fotoUrl
                  );
                  sessionStorage.setItem('idPerfil', parsedData.id_perfil); // Guarda el nombre en sessionStorage
                  this.currentUserNombre.next(parsedData.clave);
                  this.currentUserProfileImage.next(
                    parsedData.fotoUrl + '?' + Date.now()
                  );
                } catch (e) {
                  // If the backend returns just a string (e.g., image URL), use it directly
                  sessionStorage.setItem('userProfileImage', data);
                }
              },
              error: (err) => console.error('Error en la petición:', err),
            });
        }),
        map((userData) => userData.token),
        catchError(this.handleError)
      );
  }

  refreshComponent(): void {
    const rawImage = sessionStorage.getItem('userProfileImage');
    if (rawImage) {
      this.userProfileImage = `${rawImage}?${Date.now()}`;
      this.currentUserProfileImage.next(this.userProfileImage);
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    this.currentUserNombre = new BehaviorSubject<string>('');
    this.currentUserProfileImage = new BehaviorSubject<string>('');
    this.currentUserData.next('');
    sessionStorage.clear();
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
