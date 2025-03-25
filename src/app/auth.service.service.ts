import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private backendUrl = 'http://localhost:8080/login';

  constructor(private auth: Auth, private http: HttpClient) {}

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  registerBackend(email: string, password: string): Promise<void> {
    const user = {
      email,
      password,
      nombre: email,
      clave: password,
      tipoUsuario: 'Administrador',
    };
    return lastValueFrom(
      this.http.post<void>(this.backendUrl, user, {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}
