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
  apiUrl = 'http://localhost:8080/ofertas/buscar';
  busquedaRealizada: boolean = false;
  resultados: any[] = [];
  ofertaEmpresa = new FormControl('');
  criterio = 'oferta';
  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private webSocketService: WebSocketService,
    private aplicacionService: AplicacionServiceService, // Inyecta el servicio aquí
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.webSocketService.connect('ws://localhost:8080/ws'); // URL del servidor WebSocket
    if (this.webSocketService['socket']) {
      this.webSocketService['socket'].onmessage = (event) => {
        const newImageUrl = event.data; // Recibir URL de nueva imagen
      };
    }
    this.userLoginOn = !!sessionStorage.getItem('token'); // Verifica si hay token
    this.http
      .get<
        {
          idOferta: number;
          nombreOferta: string;
          descripcionOferta: string;
          fotoOferta: string;
          empresa: { nombre: string };
        }[]
      >('http://localhost:8080/ofertas/todas')
      .subscribe({
        next: (data) => {
          this.ofertas = data.map((oferta) => ({
            idOferta: oferta.idOferta,
            nombreOferta: oferta.nombreOferta,
            descripcionOferta: oferta.descripcionOferta,
            fotoOferta: oferta.fotoOferta,
            empresa: oferta.empresa,
          }));
        },
        error: (error) => {
          console.error('Error al cargar las ofertas:', error);
        },
      });
  }

  searchJobs(event: Event) {
    event.preventDefault();
    const termino = this.ofertaEmpresa.value?.trim();
    if (!termino) {
      this.resultados = [];
      this.busquedaRealizada = false;
      return;
    }

    let params = new HttpParams();
    if (this.criterio === 'oferta') {
      params = params.set('nombreOferta', termino);
    } else if (this.criterio === 'empresa') {
      params = params.set('descripcionEmpresa', termino);
    } else if (this.criterio === 'rubro') {
      params = params.set('descripcionRubro', termino);
    }
    this.http.get(`${this.apiUrl}`, { params }).subscribe(
      (data: any) => {
        this.resultados = data;
        this.busquedaRealizada = true;
        console.log('Resultados:', this.resultados);
      },
      (error) => console.error('Error al buscar empleos:', error)
    );
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Desconectar al destruir el componente
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
                { duration: 6000 }
              );
            } else {
              this.snackBar.open(
                `Ya aplicaste para Oferta: ${nombreOferta}`,
                'Cerrar',
                {
                  duration: 4000,
                }
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
              }
            );
          },
        });
    } else {
      this.snackBar.open(
        'No se encontró perfil de usuario en la sesión',
        'Cerrar',
        {
          duration: 5000,
        }
      );
    }
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
