import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AplicacionServiceService } from '../home/cuerpo/aplicacion-service.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router'; // 👈 IMPORTANTE
import { NavigationService } from '../navigation.service.ts.service';
@Component({
  selector: 'app-detalle-oferta',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIcon,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './detalle-oferta.component.html',
  styleUrl: './detalle-oferta.component.css',
})
export class DetalleOfertaComponent {
  oferta: any;
  isBtnAplicar: boolean = false;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private aplicacionService: AplicacionServiceService,
    private navigationService: NavigationService,
  ) {
    const navegacionActual = this.router.getCurrentNavigation();
    this.oferta = navegacionActual?.extras.state?.['oferta'];

    if (this.oferta) {
      sessionStorage.setItem('oferta_actual', JSON.stringify(this.oferta));
    } else {
      const ofertaGuardada = sessionStorage.getItem('oferta_actual');
      if (ofertaGuardada) {
        this.oferta = JSON.parse(ofertaGuardada);
      }
    }

    if (!this.oferta) {
      this.volver();
    }
  }

  getDescripcionFormateada(texto: string): string {
    if (!texto) return '';
    const lineas = texto.split('\n');
    let html = '';
    lineas.forEach((linea) => {
      if (linea.trim().startsWith('-')) {
        if (!html.includes('<ul>')) html += '<ul>';
        html += `<li>${linea.replace('-', '').trim()}</li>`;
      } else if (linea.trim() !== '') {
        html += `<p>${linea.trim()}</p>`;
      }
    });
    if (html.includes('<ul>')) html += '</ul>';
    return html;
  }

  aplicar(idOferta: number, nombreOferta: string): void {
    const idPerfil = sessionStorage.getItem('idPerfil');
    const token = sessionStorage.getItem('token');
    if (token) {
      this.aplicacionService.procesarPostulacion(
        Number(idOferta),
        Number(idPerfil),
        nombreOferta,
        () => {
          this.isBtnAplicar = true;
        },
      );
    } else {
      this.snackBar.open(
        'No se encontró perfil de usuario en la sesión',
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  volver(): void {
    const destino = this.navigationService.getPreviousUrl();
    console.log('Navegando a:', destino);
    this.router.navigate([destino]);
  }
}
