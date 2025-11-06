import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-portada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-portada.component.html',
  styleUrls: ['./login-portada.component.css'],
})
export class LoginPortadaComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login-user']);
    }, 4000);
  }
}
