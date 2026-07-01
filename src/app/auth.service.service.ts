import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { browserSessionPersistence, setPersistence } from 'firebase/auth';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private backendUrl = 'http://localhost:8080/login';
  private apiUrl = environment.local.urlApi;
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

  registerBackend(email: string, password: string, dni: string): Promise<void> {
    const user = {
      email,
      password,
      nombre: email,
      clave: password,
      tipoUsuario: 'Administrador',
      dni,
    };
    return lastValueFrom(
      this.http.post<void>(this.backendUrl, user, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  login(email: string, password: string) {
    return setPersistence(this.auth, browserSessionPersistence).then(() => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  logout() {
    return signOut(this.auth);
  }
}
