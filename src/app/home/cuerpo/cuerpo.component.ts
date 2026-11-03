import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WebSocketService } from '../../admincontrol/modal-nueva-oferta/web-socket.service';
import { AplicacionServiceService } from './aplicacion-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-cuerpo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    NgIf,
    NgFor,
    RouterModule,
  ], // Importa Material Card y módulos necesarios
  templateUrl: './cuerpo.component.html',
  styleUrl: './cuerpo.component.css',
})
export class CuerpoComponent implements OnInit {
  errorMessage: string = '';
  userLoginOn: boolean = false;
  token: string = '';
  isBtnAplicar: boolean = false;
  [x: string]: any;
  ofertas: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    empresa: { nombre: string };
  }[] = [];
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 5; // Número de elementos por página
  searchNombreOferta = new FormControl('');
  searchDescripcionEmpresa = new FormControl('');
  urlApiTodas = environment.local.urlApi;
  busquedaRealizada: boolean = false;
  resultados: any[] = [];
  ofertaEmpresa = new FormControl('');
  criterio = 'oferta';
  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private webSocketService: WebSocketService,
    private aplicacionService: AplicacionServiceService, // Inyecta el servicio aquí
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.webSocketService.connect('/ws');
    if (this.webSocketService['socket']) {
      this.webSocketService['socket'].onmessage = (event) => {
        const newImageUrl = event.data;
        console.log('Nueva URL de imagen recibida:', newImageUrl);
      };
    }
    this.userLoginOn = !!sessionStorage.getItem('token');
    this.cargarOfertasActivas();
  }

  
searchJobs(event: Event): void {
  event.preventDefault();

  const termino = this.ofertaEmpresa.value?.trim().toLowerCase();

  this.currentPage = 1;

  if (!termino) {
    this.cargarOfertasActivas();
    return;
  }

  this.http
    .get<any[]>(this.urlApiTodas + '/ofertas/todas/activas')
    .subscribe({
      next: (data) => {
        this.ofertas = data.filter((oferta) => {
          const nombreOferta =
            oferta.nombreOferta?.toLowerCase() ?? '';

          const nombreEmpresa =
            oferta.empresa?.nombre?.toLowerCase() ?? '';

          const nombreRubro =
            oferta.empresa?.rubro?.descripcionRubro?.toLowerCase() ?? '';

          switch (this.criterio) {
            case 'oferta':
              return nombreOferta.includes(termino);

            case 'empresa':
              return nombreEmpresa.includes(termino);

            case 'rubro':
              return nombreRubro.includes(termino);

            default:
              return false;
          }
        });

        console.log('Criterio:', this.criterio);
        console.log('Término:', termino);
        console.log('Ofertas encontradas:', this.ofertas);
      },
      error: (error) => {
        console.error('Error al buscar empleos:', error);
        this.snackBar.open(
          'No se pudieron buscar las ofertas.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
}


  cargarOfertasActivas(): void {
    this.http
      .get<any[]>(this.urlApiTodas + '/ofertas/todas/activas')
      .subscribe({
        next: (data) => {
          this.ofertas = data;
        },
        error: (error) => {
          console.error('Error al cargar las ofertas:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Desconectar al destruir el componente
  }

  aplicar(idOferta: number, nombreOferta: string): void {
    const idPerfil = Number(sessionStorage.getItem('idPerfil'));
    if (!idPerfil) {
      this.snackBar.open('No se encontró el perfil del usuario.', 'Cerrar', {
        duration: 5000,
      });
      return;
    }
    this.aplicacionService.aplicar(idOferta, idPerfil).subscribe({
      next: (response: any) => {
        const mensaje =
          response?.mensaje ??
          'Aplicación enviada con éxito.';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });

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

  verDetalle(oferta: any): void {
    this.router.navigate(['/detalle-oferta'], {
      state: { oferta: oferta },
    });
  }

  /////////////////////////Paginacion///////////////////////////////////////
  getPaginatedDataOfertas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertas.slice(startIndex, endIndex);
  }
  trackById(index: number, oferta: any): number {
    return oferta.idOferta;
  }
  getPaginatedDataEmpresas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertas.slice(startIndex, endIndex);
  }
  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }
  getTotalPages() {
    return Math.ceil(this.ofertas.length / this.itemsPerPage);
  }
}
