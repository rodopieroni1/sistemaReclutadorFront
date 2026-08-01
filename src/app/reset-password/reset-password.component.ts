import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  form!: FormGroup;
  isLoading = false;
  errorMessage: any;
  actualizado = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    // Primero se crea el form
    this.form = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/,
          ),
        ],
      ],
    });

    // Después se accede a sus propiedades
    this.form.get('newPassword')?.valueChanges.subscribe((value) => {});
  }

  ngOnInit() {
    this.form.get('newPassword')?.valueChanges.subscribe(() => {
      console.log('¿Formulario válido?:', this.form.valid);
    });
  }

  resetear() {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.isLoading = true;
    this.http
      .post(environment.local.urlHost + '/perfiles/reset-password', {
        token,
        newPassword: this.form.value.newPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.actualizado = true;
          this.form.disable();
          this.snack.open('Contraseña actualizada', 'Cerrar');
        },
        error: (err) => {
          this.isLoading = false;
          const mensaje = err.error?.message || 'Ocurrió un error inesperado';
          this.snack.open(mensaje, 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  volverLogin() {
    this.router.navigate(['/login-user']);
  }
}
