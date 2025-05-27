import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegacionComponent } from './navegacion/navegacion.component';
import { LoginService } from '../../loginuser/auth/login.service';
import { User } from '../../loginuser/auth/user';
import { environment } from '../../../environments/environment';
import { UserServiceService } from '../../loginuser/user-service.service';
import { NavigationServiceService } from '../../navigation-service.service';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [NavegacionComponent, CommonModule],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
})
export class CabeceraComponent implements OnInit {
  isMenuOpen: boolean = false;
  userLoginOn: boolean = false;
  userProfileImage: string = '';
  errorMessage: string = '';
  user?: User;
  userName: string = '';
  mostrarCabecera: boolean = true;
  constructor(
    private userServiceService: UserServiceService,
    private loginService: LoginService,
    private cdRef: ChangeDetectorRef,
    private navigationService: NavigationServiceService
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
    this.userName = sessionStorage.getItem('userName') || 'Usuario desconocido';
    this.userLoginOn = !!sessionStorage.getItem('token'); // Verifica si hay token
    this.userProfileImage = sessionStorage.getItem('userProfileImage') || '';
    this.cdRef.detectChanges(); // Forza la actualización en el DOM
    this.navigationService.previousUrl$.subscribe((url) => {
      this.mostrarCabecera = url !== '/admincontrol';
    });
  }
}
