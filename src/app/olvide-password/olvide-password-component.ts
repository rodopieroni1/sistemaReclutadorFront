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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.local.urlApi;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      clave: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      clave: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.route.queryParams.subscribe((params) => {
      if (params['usuario']) {
        this.form.patchValue({
          clave: params['usuario'],
        });
      }
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
      .post<{
        message: string;
      }>(this.apiUrl + '/perfiles/olvide-password', this.form.value)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          const successMessage =
            res?.message || 'Solicitud enviada correctamente.';
          this.snack.open(successMessage, 'Cerrar');
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
