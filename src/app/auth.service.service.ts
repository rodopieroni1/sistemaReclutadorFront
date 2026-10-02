import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Auth,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface LoginUsuarioResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private apiUrl = environment.local.urlApi;
  private backendUrl = environment.local.urlApi + '/login';

  constructor(
    private auth: Auth,
    private http: HttpClient,
  ) {}

  checkEmailAndDni(
    email: string,
    dni: string,
  ): Observable<{ emailExists: boolean; dniExists: boolean }> {
    return this.http.post<{ emailExists: boolean; dniExists: boolean }>(
      this.apiUrl + '/perfiles/verificar',
      { email, dni },
    );
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  registerBackend(
    clave: string,
    nombre: string,
    email: string,
    password: string,
  ): Promise<string> {
    const user = {
      email,
      password,
      nombre,
      clave,
    };

    return lastValueFrom(
      this.http.post(this.backendUrl, user, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text',
      }),
    );
  }

  login(clave: string, password: string): Observable<LoginUsuarioResponse> {
    return this.http.post<LoginUsuarioResponse>(
      this.apiUrl + '/usuarios/auth/login',
      {
        clave,
        password,
      },
    );
  }

  logout() {
    return signOut(this.auth);
  }
}
