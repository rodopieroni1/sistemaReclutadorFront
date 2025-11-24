import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-olvide-password-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './olvide-password-component.html',
  styleUrls: ['./olvide-password-component.css'],
})
export class OlvidePasswordComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  enviarSolicitud(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .post('http://localhost:8080/perfiles/olvide-password', this.form.value)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snack.open(
            'Revisá tu correo para restablecer la contraseña',
            'Cerrar'
          );
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message || 'Error al enviar el enlace.';
          this.snack.open('Error: ' + this.errorMessage, 'Cerrar');
        },
      });
  }
}
