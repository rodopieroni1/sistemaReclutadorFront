import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth.service.service';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  providers: [AuthServiceService], // Esto asegura que el servicio esté disponible
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  [x: string]: any;
  email: string = '';
  password: string = '';
  constructor(private router: Router) {}

  login() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, this.email, this.password)
      .then((userCredential) => {
        const user = userCredential.user;
        sessionStorage.setItem(
          'firebaseUser',
          JSON.stringify({ email: user.email }),
        );
        this.router.navigate(['/admincontrol']);
      })
      .catch((error) => {
        console.error('❌ Error de login Firebase:', error);
        alert('Usuario o contraseña incorrectas');
      });
  }
}
