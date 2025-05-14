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
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from './auth/login.service';
import { LoginRequest } from './auth/loginRequest';
@Component({
  selector: 'app-loginuser',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule, // ✅ Add this
    MatInputModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './loginuser.component.html',
  styleUrl: './loginuser.component.css',
})
export class LoginuserComponent {
  errorMessage: string = '';
  constructor(private router: Router, private loginService: LoginService) {}

  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    clave: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {}
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
          console.log(userData);
        },
        error: (errorData) => {
          console.error(errorData);
          this.errorMessage = errorData;
        },
        complete: () => {
          console.log('Login exitoso');
          this.router.navigate(['/home']);
          this.loginForm.reset();
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa todos los campos.');
    }
  }
}
