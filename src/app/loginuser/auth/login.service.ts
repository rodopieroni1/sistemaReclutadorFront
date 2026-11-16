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
  finalize,
  switchMap,
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
    let imageUrl = sessionStorage.getItem('userProfileImage');
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${this.urlApi}${imageUrl}`;
    }
    this.currentUserLoginOn = new BehaviorSubject<boolean>(!!token);
    this.currentUserData = new BehaviorSubject<string>(token || '');
    this.currentUserNombre = new BehaviorSubject<string>(userName || '');
    this.currentUserProfileImage = new BehaviorSubject<string>(
      imageUrl ? `${imageUrl}?${Date.now()}` : '',
    );

    console.log('URL foto desde sessionStorage:', imageUrl);
  }

  login(credential: LoginRequest): Observable<any> {
    return this.http
      .post<any>(this.urlApi + '/perfiles/auth/login', credential, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        switchMap((userData: any) => {
          console.log('Respuesta del login:', userData);
          sessionStorage.setItem('token', userData.token);
          sessionStorage.setItem('userName', credential.clave);
          const token = userData.token;
          return this.http
            .get(`${this.urlApi}/perfiles/name/${credential.clave}`, {
              responseType: 'text',
              headers: new HttpHeaders({
                Authorization: `Bearer ${token}`,
              }),
            })
            .pipe(
              map((data: string) => {
                const parsedData = JSON.parse(data);
                if (!parsedData.idPerfil) {
                  throw new Error('El backend no devolvió un idPerfil válido.');
                }
                sessionStorage.setItem('idPerfil', String(parsedData.idPerfil));
                sessionStorage.setItem('userName', parsedData.clave);
                const fotoUrl = parsedData.fotoUrl || '';
                sessionStorage.setItem('userProfileImage', fotoUrl);
                const fotoUrlCompleta = fotoUrl
                  ? `${this.urlApi}${fotoUrl}`
                  : '';
                this.currentUserNombre.next(parsedData.clave);
                this.currentUserProfileImage.next(
                  fotoUrlCompleta ? `${fotoUrlCompleta}?${Date.now()}` : '',
                );
                this.currentUserData.next(token);
                this.currentUserLoginOn.next(true);
                return token;
              }),
            );
        }),
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

  actualizarFotoPerfil(fotoUrl: string): void {
    sessionStorage.setItem('userProfileImage', fotoUrl);
    const urlCompleta = `${this.urlApi}${fotoUrl}?${Date.now()}`;
    this.currentUserProfileImage.next(urlCompleta);
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
      .pipe(finalize(() => this.limpiarSesion()));
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
