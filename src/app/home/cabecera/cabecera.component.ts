import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../loginuser/auth/login.service';
import { User } from '../../loginuser/auth/user';
import { environment } from '../../../environments/environment';
import { UserServiceService } from '../../perfil/user-service.service';
import { NavigationServiceService } from '../../navigation-service.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [CommonModule, RouterModule, CommonModule, MatIcon, MatIconModule],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
})
export class CabeceraComponent implements OnInit {
  dropdownAbierto = false;
  [x: string]: any;
  isMenuOpen: boolean = false;
  userLoginOn: boolean = false;
  tieneCv: boolean = false;
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
  ) {}

  ngOnInit(): void {
    this.userLoginOn = !!sessionStorage.getItem('token');
    this.tieneCv = false;
    this.user = undefined;
    if (this.userLoginOn) {
      this.cargarPerfil();
    }
    const subNombre = this.loginService.currentUserNombre.subscribe(
      (userName) => {
        this.userName = userName;
      },
    );
    const subFoto = this.loginService.currentUserProfileImage.subscribe(
      (imageUrl) => {
        if (imageUrl) {
          console.log('URL de imagen recibida:', imageUrl);
          this.userProfileImage = imageUrl;
        } else {
          this.userProfileImage = 'assets/default-profile.png';
        }
        this.cdRef.detectChanges();
      },
    );
    this.subs.push(subNombre, subFoto);
    const subNav = this.navigationService.previousUrl$.subscribe((url) => {
      this.mostrarCabecera = url !== '/admincontrol';
    });
    this.subs.push(subNav);
  }

  irAOfertas(): void {
    if (this.router.url.startsWith('/home')) {
      const seccion = document.getElementById('propuestas');

      if (seccion) {
        seccion.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          const seccion = document.getElementById('propuestas');

          if (seccion) {
            seccion.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }, 100);
      });
    }
  }

  irAContactos(): void {
    if (this.router.url.startsWith('/home')) {
      const seccion = document.getElementById('contactos');

      if (seccion) {
        seccion.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          const seccion = document.getElementById('contactos');

          if (seccion) {
            seccion.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }, 100);
      });
    }
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

  CrearCV(): void {
    if (!this.userLoginOn) {
      this.router.navigate(['/login-user']);
      return;
    }

    if (this.tieneCv) {
      return;
    }

    this.router.navigate(['/crear-cv']);
  }

  private cargarPerfil(): void {
    const id = Number(sessionStorage.getItem('idPerfil'));
    console.log('CONSULTANDO CV DEL POSTULANTE:', id);
    this.tieneCv = false;
    if (!id || isNaN(id)) {
      console.error('No se encontró un ID válido');
      return;
    }

    this.userServiceService.getUsers(id).subscribe({
      next: (userData: any) => {
        console.log('RESPUESTA COMPLETA DEL PERFIL:', userData);
        console.log('DOCUMENTO URL:', userData.documentoUrl);
        console.log('UPLOAD CV:', userData.uploadcv);

        this.user = userData;
        this.tieneCv =
          typeof userData.documentoUrl === 'string' &&
          userData.documentoUrl.trim().length > 0;

        console.log('POSTULANTE:', id);
        console.log('DOCUMENTO:', userData.documentoUrl);
        console.log('¿TIENE CV?:', this.tieneCv);

        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('ERROR AL CONSULTAR EL PERFIL:', error);
      },
    });
  }

  logout(): void {
    this.loginService
      .logout()
      .pipe(
        finalize(() => {
          this.userProfileImage = '';
          this.userName = '';
          this.userLoginOn = false;
          this.subs.forEach((sub) => sub.unsubscribe());
          this.router.navigate(['/login-user']);
        }),
      )
      .subscribe({
        error: (err) => {
          console.error('Error al cerrar sesión:', err);
        },
      });
  }

  private finalizarLogout(): void {
    this.userProfileImage = '';
    this.userName = '';
    this.userLoginOn = false;
    this.subs.forEach((sub) => sub.unsubscribe());
    this.router.navigate(['/login-user']);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
