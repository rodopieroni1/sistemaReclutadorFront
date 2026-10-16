import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth.service.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

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
    MatProgressSpinner,
  ],
  providers: [AuthServiceService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  [x: string]: any;
  clave: string = '';
  password: string = '';
  cargando: boolean = false;
  constructor(
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  login() {
    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.authService
      .login(this.clave, this.password)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('usuarioToken', response.token);
          this.router.navigate(['/admincontrol']);
        },

        error: (error) => {
          console.error('❌ Error de login:', error);
          alert('Usuario o contraseña incorrectas');
        },
      });
  }
}
