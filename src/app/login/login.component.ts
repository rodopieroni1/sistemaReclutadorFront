import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth.service.service';

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
  providers: [AuthServiceService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  [x: string]: any;
  clave: string = '';
  password: string = '';
  constructor(
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  login() {
    this.authService.login(this.clave, this.password).subscribe({
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
