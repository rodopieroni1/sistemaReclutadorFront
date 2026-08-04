import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-piedepagina',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './piedepagina.component.html',
  styleUrl: './piedepagina.component.css',
})
export class PiedepaginaComponent {
  currentYear = new Date().getFullYear();
  constructor(private router: Router) {}

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
}
