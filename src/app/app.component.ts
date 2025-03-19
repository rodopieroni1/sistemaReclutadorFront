import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthComponent } from './service/auth.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>¡Aplicación Angular con Firebase!</h1>
    <app-auth></app-auth>
  `,
  imports: [AuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'proyectoReclutador';
}
