import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './AuthService';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [
    MatToolbarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  displayName: string = '';
  constructor(public authService: AuthService) {}
  ngOnInit() {
    this.displayName = this.authService.getUserDetails();
  }
  logOut() {
    this.authService.logout();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }
  login() {}
}
