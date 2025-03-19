import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      <h2>Registro</h2>
      <input [(ngModel)]="registerEmail" placeholder="Email" />
      <input
        [(ngModel)]="registerPassword"
        type="password"
        placeholder="Password"
      />
      <h1>email password</h1>
      <button (click)="register(registerEmail, registerPassword)">
        Registrar
      </button>

      <h2>Login</h2>
      <input [(ngModel)]="loginEmail" placeholder="Email" />
      <input
        [(ngModel)]="loginPassword"
        type="password"
        placeholder="Password"
      />
      <button (click)="login(loginEmail, loginPassword)">Ingresar</button>
    </div>
  `,
})
export class AuthComponent {
  registerEmail: any;
  registerPassword: any;
  register(email: string, password: string): void {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Registro exitoso
        console.log('Usuario registrado:', userCredential.user);
      })
      .catch((error) => {
        // Manejo de errores
        console.error('Error en el registro:', error.message);
      });
  }
  loginEmail: any;
  loginPassword: any;
  login(email: string, password: string) {
    {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Inicio de sesión exitoso
          console.log('Usuario autenticado:', userCredential.user);
        })
        .catch((error) => {
          // Manejo de errores
          console.error('Error en el inicio de sesión:', error.message);
        });
    }
  }
}
