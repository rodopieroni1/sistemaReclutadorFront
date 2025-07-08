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
  dni: string = '';

  constructor(private authService: AuthServiceService) {}

  register() {
    if (!this.email || !this.password || !this.confirmPassword || !this.dni) {
      alert('Por favor, complete todos los campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

   this.authService
      .checkEmailAndDni(this.email, this.dni)
      .subscribe((response) => {
        if (response.emailExists) {
          alert('Este correo electrónico ya está registrado');
        } else if (response.dniExists) {
          alert('Este DNI ya está registrado');
        } else {
          this.authService
            .registerBackend(this.email, this.password, this.dni)
            .then(() => {
              alert('Usuario registrado exitosamente');
            })
            .catch((error) => {
              console.error('Error en el registro:', error);
              alert('El registro no se realizó correctamente');
            });
        }
      });
  }
}
