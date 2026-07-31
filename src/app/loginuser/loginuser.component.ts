import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from './auth/login.service';
import { LoginRequest } from './auth/loginRequest';
import { interval, Subscription } from 'rxjs';

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
    private loginService: LoginService,
  ) {}

  private formBuilder = inject(FormBuilder);

  loginForm = this.formBuilder.group({
    clave: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const isExpired = this.route.snapshot.queryParamMap.get('expired');
    if (isExpired === 'true') {
      this.sessionExpired = true;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
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
          this.loginService.iniciarHeartbeat();
          this.router.navigate(['/home']);
          //  this.loginForm.reset();
        },
        error: (errorData) => {
          console.error(errorData);

          if (errorData.error && errorData.error.error) {
            this.errorMessage = errorData.error.error;
          } else {
            this.errorMessage = 'Error al iniciar sesión.';
          }
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
