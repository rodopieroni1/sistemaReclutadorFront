import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  // Registro
  register(email: string, password: string): Promise<any> {
    console.log('email: ' + email + 'password: ' + password);
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Login
  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout
  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
