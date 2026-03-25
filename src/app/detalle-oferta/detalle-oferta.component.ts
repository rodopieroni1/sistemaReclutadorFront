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
    private aplicacionService: AplicacionServiceService, // Inyecta el servicio aquí
  ) {
    this.oferta = history.state.oferta;
    if (!this.oferta) {
      this.router.navigate(['/home']);
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
    const idPerfil = sessionStorage.getItem('idPerfil'); // Recupera el ID del usuario logueado
    const token = sessionStorage.getItem('token'); // Suponiendo que tienes el idPerfil en la sesión
    if (token) {
      this.aplicacionService
        .aplicar(Number(idOferta), Number(idPerfil))
        .subscribe({
          next: (response) => {
            const data = response as { perfil?: any; oferta?: any };
            // Verificar si perfil y oferta son nulos o indefinidos en la respuesta
            if (data.perfil || data.oferta) {
              this.snackBar.open(
                `Acabas de aplicar para la oferta: ${nombreOferta}`,
                'Cerrar',
                { duration: 6000 },
              );
            } else {
              this.snackBar.open(
                `Ya aplicaste para Oferta: ${nombreOferta}`,
                'Cerrar',
                {
                  duration: 4000,
                },
              );
            }
            this.isBtnAplicar = true;
          },
          error: (error) => {
            this.snackBar.open(
              'Tu sesión expiró. Volvé a iniciar sesión.',
              'Cerrar',
              {
                duration: 5000,
              },
            );
          },
        });
    } else {
      this.snackBar.open(
        'No se encontró perfil de usuario en la sesión',
        'Cerrar',
        {
          duration: 5000,
        },
      );
    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
