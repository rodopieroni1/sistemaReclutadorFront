import { Component } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth.service.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],

  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthServiceService) {}

  register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      alert('Por favor, complete todos los campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    this.authService
      .register(this.email, this.password)
      .then(() => {
        console.log('Registro en Firebase exitoso');
        return this.authService.registerBackend(this.email, this.password);
      })
      .then(() => {
        console.log('Registro en el backend exitoso');
        alert('Usuario registrado exitosamente');
      })
      .catch((error) => {
        if (error.status === 403) {
          alert(
            'Permiso denegado al backend. Verifica las políticas CORS o permisos en el servidor.'
          );
        } else if (error.status === 400) {
          alert('Datos inválidos enviados al backend.');
        } else {
          console.error('Error en el registro:', error);
          alert('El registro no se realizó correctamente');
        }
      });
  }
}
