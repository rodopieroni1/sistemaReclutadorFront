import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
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
  ],
  templateUrl: './loginuser.component.html',
  styleUrl: './loginuser.component.css',
})
export class LoginuserComponent {
  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    email: ['pieroni.rodrigo@gmail.com'],
    password: [''],
  });

  ngOnInit(): void {}
}
