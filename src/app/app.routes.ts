import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminControlComponent } from './admincontrol/admincontrol.component';
import { UsuarioControlComponent } from './usuariocontrol/usuariocontrol.component';
import { LoginuserComponent } from './loginuser/loginuser.component';
import { NgModule } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthGuard } from './guards/auth.guard';
import { PostulanteGuard } from './guards/guardsPost';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { OlvidePasswordComponent } from './olvide-password/olvide-password-component';

interface JwtPayload {
  exp: number;
}

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-user', component: LoginuserComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'olvide-password', component: OlvidePasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admincontrol',
    component: AdminControlComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'usuariocontrol',
    component: UsuarioControlComponent,
    canActivate: [PostulanteGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  static isTokenExpired(token: string): boolean {
    if (!token) {
      return true; // Si no hay token, consideramos que está expirado
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000; // Convertimos a segundos
      return decoded.exp < now;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return true; // Si hay un error al decodificar, consideramos que está expirado
    }
  }
}
