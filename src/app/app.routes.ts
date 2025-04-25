import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminControlComponent } from './admincontrol/admincontrol.component';
import { UsuarioControlComponent } from './usuariocontrol/usuariocontrol.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admincontrol', component: AdminControlComponent },
  { path: 'usuariocontrol', component: UsuarioControlComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
