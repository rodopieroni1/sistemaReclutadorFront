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
  of,
  Subscription,
  interval,
} from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  [x: string]: any;
  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true,
  );
  currentUserData: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentUserNombre: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentUserProfileImage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  userProfileImage: string | undefined;
  currentPerfilId!: number | 0;
  urlApi = environment.local.urlApi;
  private pingSubscription?: Subscription;

  constructor(private http: HttpClient) {
    const token = sessionStorage.getItem('token');
    const userName = sessionStorage.getItem('userName');
    const imageUrl = sessionStorage.getItem('userProfileImage');

    this.currentUserLoginOn = new BehaviorSubject<boolean>(!!token);
    this.currentUserData = new BehaviorSubject<string>(token || '');
    this.currentUserNombre = new BehaviorSubject<string>(userName || '');
    this.currentUserProfileImage = new BehaviorSubject<string>(
      imageUrl ? `${imageUrl}?${Date.now()}` : '',
    );
  }

  login(credential: LoginRequest): Observable<any> {
    return this.http
      .post<any>(this.urlApi + '/perfiles/auth/login', credential, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        tap((userData: any) => {
          sessionStorage.setItem('idUsuario', userData.id);
          sessionStorage.setItem('token', userData.token); // Guarda el token en sessionStorage
          sessionStorage.setItem('userName', credential.clave); // Guarda el nombre en sessionStorage
          this.currentUserLoginOn.next(true);
          let nombreRec = sessionStorage.getItem('userName');
          const token = sessionStorage.getItem('token');

          this.http
            .get(`${this.urlApi}/perfiles/name/${nombreRec}`, {
              responseType: 'text',
              headers: new HttpHeaders({
                Authorization: `Bearer ${token}`,
              }),
            })
            .subscribe({
              next: (data) => {
                try {
                  const parsedData = JSON.parse(data);
                  sessionStorage.setItem('userName', parsedData.clave);
                  sessionStorage.setItem(
                    'userProfileImage',
                    parsedData.fotoUrl,
                  );
                  sessionStorage.setItem('idPerfil', parsedData.id_perfil); // Guarda el nombre en sessionStorage
                  this.currentUserNombre.next(parsedData.clave);
                  this.currentUserProfileImage.next(
                    parsedData.fotoUrl + '?' + Date.now(),
                  );
                  this.currentUserLoginOn.next(true);
                } catch (e) {
                  sessionStorage.setItem('userProfileImage', data);
                }
              },
              error: (err) => console.error('Error en la petición:', err),
            });
        }),
        map((userData) => userData.token),
        catchError(this.handleError),
      );
  }

  iniciarHeartbeat() {
    if (this.pingSubscription) {
      return;
    }

    this.pingSubscription = interval(60000).subscribe(() => {
      this.ping().subscribe({
        next: () => console.log('Heartbeat OK'),
        error: (err) => console.error('Heartbeat ERROR', err),
      });
    });
  }
  ping(): Observable<any> {
    const token = sessionStorage.getItem('token');

    return this.http.get(`${this.urlApi}/perfiles/auth/ping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  refreshComponent(): void {
    const rawImage = sessionStorage.getItem('userProfileImage');
    if (rawImage) {
      this.userProfileImage = `${rawImage}?${Date.now()}`;
      this.currentUserProfileImage.next(this.userProfileImage);
    }
  }

  logout(): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.limpiarSesion();
      return of(null);
    }
    return this.http
      .post(
        `${this.urlApi}/perfiles/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .pipe(tap(() => this.limpiarSesion()));
  }

  private limpiarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.currentUserNombre.next('');
    this.currentUserProfileImage.next('');
    this.currentUserData.next('');
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrió un ERROR', error.error);
    } else {
      console.error(
        'Backend retornó código de Error',
        error.status,
        error.error,
      );
    }

    return throwError(() => error);
  }

  getUserData(): Observable<String> {
    return this.currentUserData.asObservable();
  }

  getLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }
}
