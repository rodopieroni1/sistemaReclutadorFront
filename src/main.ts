import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

import { LoginComponent } from './app/login/login.component';
import { RegisterComponent } from './app/register/register.component';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { HomeComponent } from './app/home/home.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirigir al login por defecto
    ]),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideHttpClient(), // Configuración global de HttpClient
    provideRouter(routes),
    provideAuth(() => getAuth()),
  ],
});
