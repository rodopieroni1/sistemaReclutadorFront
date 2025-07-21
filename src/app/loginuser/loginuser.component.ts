import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from './auth/login.service';
import { LoginRequest } from './auth/loginRequest';
@Component({
  selector: 'app-loginuser',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './loginuser.component.html',
  styleUrl: './loginuser.component.css',
})
export class LoginuserComponent implements OnInit {
  errorMessage: string = '';
  sessionExpired = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    clave: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  ngOnInit(): void {
    let expiredParam = false;

    this.route.queryParams.subscribe((params) => {
      expiredParam = params['expired'] === 'true';

      if (expiredParam) {
        this.sessionExpired = true;

        // Limpiar el parámetro sin perder el estado
        this.router.navigate([], {
          queryParams: { expired: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
      console.log('Session expired:', this.sessionExpired);
    });
  }

  get email() {
    return this.loginForm.controls.clave;
  }
  get password() {
    return this.loginForm.controls.password;
  }

  login() {
    if (this.loginForm.valid) {
      this.loginService.login(this.loginForm.value as LoginRequest).subscribe({
        next: (userData) => {
          this.router.navigate(['/home']);
          //  this.loginForm.reset();
        },
        error: (errorData) => {
          console.error(errorData);
          this.errorMessage = errorData;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa todos los campos.');
    }
  }

  hideMessage(): void {
    this.sessionExpired = false;
  }
}
