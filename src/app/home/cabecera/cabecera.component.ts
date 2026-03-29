import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../loginuser/auth/login.service';
import { User } from '../../loginuser/auth/user';
import { environment } from '../../../environments/environment';
import { UserServiceService } from '../../loginuser/user-service.service';
import { NavigationServiceService } from '../../navigation-service.service';
import { NavegacionComponent } from './navegacion/navegacion.component';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [NavegacionComponent, CommonModule, RouterModule, CommonModule],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
})
export class CabeceraComponent implements OnInit {
  [x: string]: any;
  isMenuOpen: boolean = false;
  userLoginOn: boolean = false;
  userProfileImage: string = '';
  errorMessage: string = '';
  user?: User;
  userName: string = '';
  mostrarCabecera: boolean = true;
  menuAbierto = false;
  private subs: Subscription[] = [];

  constructor(
    private userServiceService: UserServiceService,
    private loginService: LoginService,
    private cdRef: ChangeDetectorRef,
    private navigationService: NavigationServiceService,
    private router: Router,
  ) {
    this.userServiceService.getUsers(environment.local.userId).subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (errorData) => {
        console.error(errorData);
      },
    });
  }
  ngOnInit() {
    this.loginService.currentUserNombre.subscribe((userName) => {
      this.userName = userName;
    });
    this.loginService.currentUserProfileImage.subscribe((img) => {
      this.userProfileImage = img || 'assets/default-profile.png';
    });

    // this.userName = sessionStorage.getItem('userName') || 'Usuario desconocido';
    this.userLoginOn = !!sessionStorage.getItem('token'); // Verifica si hay token
    this.loginService.currentUserProfileImage.subscribe((imageUrl) => {
      this.userProfileImage = imageUrl
        ? `${imageUrl}?${Date.now()}`
        : 'assets/default-profile.png';
      this.cdRef.detectChanges(); // Asegura render
    });
    this.cdRef.detectChanges(); // Forza la actualización en el DOM
    this.navigationService.previousUrl$.subscribe((url) => {
      this.mostrarCabecera = url !== '/admincontrol';
    });
  }

  editarPerfil(): void {
    if (this.userLoginOn) {
      this.router.navigate(['/editar-perfil']);
    } else {
      this.router.navigate(['/login-user']);
    }
  }

  misAplicaciones(): void {
    if (this.userLoginOn) {
      this.router.navigate(['/mis-aplicaciones']);
    } else {
      this.router.navigate(['/login-user']);
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.userProfileImage = '';
    this.userName = '';
    this.userLoginOn = false;
    this.subs.forEach((sub) => sub.unsubscribe());
    this.loginService.logout();
    this.router.navigate(['/login-user']);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
