import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthComponent } from './service/auth.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: ` <app-auth></app-auth> `,
  imports: [AuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'proyectoReclutador';
}
