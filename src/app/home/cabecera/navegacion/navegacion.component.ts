import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../loginuser/auth/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css',
})
export class NavegacionComponent implements OnInit {
  userLoginOn: boolean = false;
  userProfileImage: string = '';
  userProfileName: string = '';
  menuAbierto = false;
  private subs: Subscription[] = [];

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loginService.currentUserLoginOn.subscribe((isLoggedIn) => {
      this.userLoginOn = isLoggedIn;
      console.log('Estado de inicio de sesión:', isLoggedIn);
      if (isLoggedIn) {
        const profileImage = sessionStorage.getItem('userProfileImage');
        this.userProfileImage = profileImage
          ? `${profileImage}?${new Date().getTime()}`
          : 'assets/logo.png';
        this.userProfileName = localStorage.getItem('userName') || '';
      } else {
        this.userProfileImage = 'assets/logo.png';
        this.userProfileName = '';
      }
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.userProfileImage = '';
    this.userProfileName = '';
    this.userLoginOn = false;
    this.subs.forEach((sub) => sub.unsubscribe());
    this.loginService.logout();
    this.router.navigate(['/login-user']);
  }
}
