import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../loginuser/auth/login.service';

@Component({
  selector: 'app-navegacion',
  imports: [RouterModule, CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css',
})
export class NavegacionComponent implements OnInit {
  userLoginOn: boolean = false;
  userProfileImage: string = '';
  userProfileName: string = '';
  constructor(private loginService: LoginService) {}
  /*ngOnDestroy(): void {
    this.loginService.currentUserLoginOn.unsubscribe();
    this.loginService.currentUserData.unsubscribe();
  }*/

  ngOnInit(): void {
    this.loginService.currentUserLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
        this.userProfileName = localStorage.getItem('userName') || '';
        this.userProfileImage = localStorage.getItem('userProfileImage') || '';
      },
    });
  }

  logout() {
    this.loginService.currentUserLoginOn.unsubscribe();
    this.loginService.currentUserData.unsubscribe();
    this.loginService.currentUserNombre.unsubscribe();
    this.loginService.currentUserProfileImage.unsubscribe();
    this.loginService.logout();
  }
}
