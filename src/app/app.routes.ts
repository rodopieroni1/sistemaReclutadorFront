import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminControlComponent } from './admincontrol/admincontrol.component';
import { UsuarioControlComponent } from './usuariocontrol/usuariocontrol.component';
import { LoginuserComponent } from './loginuser/loginuser.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard'; // asegurate de importar el guard

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-user', component: LoginuserComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admincontrol',
    component: AdminControlComponent,
    //canActivate: [AuthGuard],
  },
  { path: 'usuariocontrol', component: UsuarioControlComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
