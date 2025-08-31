import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../loginuser/auth/login.service';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private loginService: LoginService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loginService.currentUserLoginOn.subscribe((isLoggedIn) => {
      this.userLoginOn = isLoggedIn;
      if (isLoggedIn) {
        this.cd.detectChanges(); // 🔄 fuerza el renderizado de la vista
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

  editarPerfil(): void {
    if (this.userLoginOn) {
      console.log('Redirigiendo a editar perfil');
      this.router.navigate(['/editar-perfil']);
    } else {
      console.log('No va la cancion');
      this.router.navigate(['/login-user']);
    }
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
