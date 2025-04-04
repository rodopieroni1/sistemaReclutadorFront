import { Component } from '@angular/core';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { CuerpoComponent } from './cuerpo/cuerpo.component';
import { PiedepaginaComponent } from './piedepagina/piedepagina.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CabeceraComponent, CuerpoComponent, PiedepaginaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
