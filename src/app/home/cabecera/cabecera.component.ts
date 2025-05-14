import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegacionComponent } from './navegacion/navegacion.component';
import { LoginService } from '../../loginuser/auth/login.service';
import { User } from '../../loginuser/auth/user';
import { environment } from '../../../environments/environment';
import { UserServiceService } from '../../loginuser/user-service.service';

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
  constructor(
    private userServiceService: UserServiceService,
    private loginService: LoginService
  ) {
    this.userServiceService.getUsers(environment.local.userId).subscribe({
      next: (userData) => {
        console.log('Antes de usuariosCargados', userData);
        this.user = userData;
      },
      error: (errorData) => {
        console.error(errorData);
      },
      complete: () => {
        console.log('Usuarios cargados');
      },
    });
  }
  ngOnInit() {
    this.userName = sessionStorage.getItem('userName') || 'Usuario desconocido';
    this.userLoginOn = !!sessionStorage.getItem('token'); // Verifica si hay token
    this.userProfileImage = sessionStorage.getItem('userProfileImage') || '';
  }
}
