import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ModificarPasswordUsuarioServiceService } from './modificar-password-usuario-service.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modificar-password-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './modificar-password-admin.component.html',
  styleUrl: './modificar-password-admin.component.css',
})
export class ModificarPasswordAdminComponent {
  [x: string]: any;
  constructor(
    private http: HttpClient,
    private modificarPasswordUsuarioService: ModificarPasswordUsuarioServiceService,
    private router: Router,
  ) {}

  password = '';
  confirmPassword = '';

  errorMensaje = '';
  mensajeExito = '';
  cargando = false;

  get passwordInvalida(): boolean {
    return this.password.length < 8;
  }

  get passwordsNoCoinciden(): boolean {
    return (
      this.confirmPassword.length > 0 && this.password !== this.confirmPassword
    );
  }

  cambiarPassword(): void {
    this.errorMensaje = '';
    this.mensajeExito = '';

    if (this.passwordInvalida) {
      this.errorMensaje = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    this.modificarPasswordUsuarioService
      .cambiarPassword({
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.mensajeExito = 'La contraseña se modificó correctamente.';

          this.password = '';
          this.confirmPassword = '';
          this.cargando = false;
        },
        error: (error) => {
          this.errorMensaje =
            error.error?.message ||
            error.error?.mensaje ||
            'No se pudo modificar la contraseña.';

          this.cargando = false;
        },
      });
  }

  volverAlLogin(event: Event): void {
    event.preventDefault();
    sessionStorage.removeItem('usuarioToken');
    this.router.navigate(['/login']);
  }
}
