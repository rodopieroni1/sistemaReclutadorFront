import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardContent } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatCard } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-olvide-password-component',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardContent,
    MatCardTitle,
    MatCard,
  ],
  templateUrl: './olvide-password-component.html',
  styleUrl: './olvide-password-component.css',
})
export class OlvidePasswordComponent {
  form;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  enviarSolicitud() {
    this.isLoading = true;

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
          this.snack.open('Error: ' + err.error.message, 'Cerrar');
        },
      });
  }
}
