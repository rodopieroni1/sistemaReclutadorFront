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
import { environment } from '../../environments/environment';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import { CarinaAIService, CompatibilidadDTO } from './carina-ai.service';

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
    CabeceraComponent,
  ],
  templateUrl: './detalle-oferta.component.html',
  styleUrl: './detalle-oferta.component.css',
})
export class DetalleOfertaComponent {
  oferta: any;
  isBtnAplicar: boolean = false;
  apiUrl = environment.local.urlApi;
  compatibilidad: CompatibilidadDTO | null = null;
  analizandoCompatibilidad = false;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private aplicacionService: AplicacionServiceService,
    private navigationService: NavigationService,
    private carinaAIService: CarinaAIService,
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
  }

  aplicar(idOferta: number, nombreOferta: string): void {
    console.log(
      'Aplicando a la oferta:',
      idOferta,
      'Nombre de la oferta:',
      nombreOferta,
    );

    const idPerfil = Number(sessionStorage.getItem('idPerfil'));
    const token = sessionStorage.getItem('token');
    console.log(
      'Aplicando a la oferta:',
      idOferta,
      'Nombre de la oferta:',
      nombreOferta,
      'Token:',
      token,
      'ID del perfil:',
      idPerfil,
    );

    if (!token || !idPerfil) {
      this.snackBar.open(
        'No se encontró perfil de usuario en la sesión.',
        'Cerrar',
        { duration: 5000 },
      );
      return;
    }

    this.aplicacionService.aplicar(idOferta, idPerfil).subscribe({
      next: (response: any) => {
        const message =
          response?.message ??
          (typeof response === 'string' ? response : 'Aplicación procesada.');
        this.snackBar.open(message, 'Cerrar', { duration: 5000 });

        this.isBtnAplicar = true;
      },

      error: () => {
        this.snackBar.open(
          'Hubo un problema al procesar la solicitud.',
          'Cerrar',
          { duration: 5000 },
        );
      },
    });
  }

  analizarCompatibilidad(): void {
    if (!this.oferta?.idOferta) {
      return;
    }

    this.analizandoCompatibilidad = true;
    this.compatibilidad = null;

    this.carinaAIService
      .analizarMiCompatibilidad(this.oferta.idOferta)
      .subscribe({
        next: (resultado) => {
          this.compatibilidad = resultado;
          this.analizandoCompatibilidad = false;
        },
        error: (error) => {
          this.analizandoCompatibilidad = false;

          const mensaje =
            error.status === 409
              ? 'Necesitás cargar un CV antes de analizar tu compatibilidad.'
              : error.status === 401
                ? 'Tu sesión venció. Ingresá nuevamente.'
                : 'No se pudo analizar la compatibilidad. Intentá nuevamente.';

          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        },
      });
  }
}
