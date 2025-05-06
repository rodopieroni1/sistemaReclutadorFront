import { Component } from '@angular/core';
import { NavegacionComponent } from './navegacion/navegacion.component';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [NavegacionComponent],
  templateUrl: './cabecera.component.html',
  styleUrl: './cabecera.component.css',
})
export class CabeceraComponent {
  isMenuOpen: boolean = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
