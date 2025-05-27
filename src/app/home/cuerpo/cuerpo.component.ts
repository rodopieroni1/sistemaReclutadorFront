import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../admincontrol/modal-nueva-oferta/web-socket.service';
import { AplicacionServiceService } from './aplicacion-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  [x: string]: any;
  ofertas: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    empresa: { nombre: string };
  }[] = [];
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Número de elementos por página
  searchNombreOferta = new FormControl('');
  searchDescripcionEmpresa = new FormControl('');
  apiUrl = 'http://localhost:8080/ofertas/buscar';
  busquedaRealizada: boolean = false;
  resultados: any[] = [];
  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private webSocketService: WebSocketService,
    private aplicacionService: AplicacionServiceService // Inyecta el servicio aquí
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
    event.preventDefault(); // Evita el comportamiento por defecto del formulario
    const nombreOferta = this.searchNombreOferta.value?.trim() || '';
    const descripcionEmpresa =
      this.searchDescripcionEmpresa.value?.trim() || '';

    if (!nombreOferta && !descripcionEmpresa) {
      this.resultados = []; // Limpia los resultados si la búsqueda está vacía
      this.busquedaRealizada = false; // Si no hay búsqueda, mantenemos falso
      return;
    }

    const queryParams = `?nombreOferta=${nombreOferta}&descripcionEmpresa=${descripcionEmpresa}`;
    this.http.get(`${this.apiUrl}${queryParams}`).subscribe(
      (data: any) => {
        this.resultados = data;
        this.busquedaRealizada = true; // Activamos la bandera cuando hay resultados
        console.log('Resultados:', this.resultados);
      },
      (error) => console.error('Error al buscar empleos:', error)
    );
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Desconectar al destruir el componente
  }

  aplicar(idOferta: number): void {
    const idPerfil = sessionStorage.getItem('id_perfil'); // Recupera el ID del usuario logueado
    const token = sessionStorage.getItem('token'); // Suponiendo que tienes el idPerfil en la sesión
    if (token) {
      this.aplicacionService
        .aplicar(Number(idOferta), Number(idPerfil))
        .subscribe({
          next: (response) => {
            console.log('Aplicación enviada con éxito', response);
          },
          error: (error) => {
            console.error('Error al aplicar a la oferta:', error);
          },
        });
    } else {
      console.error('No se encontró perfil de usuario en la sesión.');
    }
  }

  /////////////////////////Paginacion///////////////////////////////////////
  getPaginatedDataOfertas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertas.slice(startIndex, endIndex);
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
