import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ListadoOfertasService } from '../../listado-ofertas.service';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../admincontrol/modal-nueva-oferta/web-socket.service';
import { User } from '../../loginuser/auth/user';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cuerpo',
  standalone: true,
  imports: [CommonModule, MatCardModule], // Importa Material Card y módulos necesarios
  templateUrl: './cuerpo.component.html',
  styleUrl: './cuerpo.component.css',
})
export class CuerpoComponent implements OnInit {
  errorMessage: string = '';
  user?: User;

  [x: string]: any;
  ofertas: {
    idOferta: number;
    descripcionOferta: string;
    fotoOferta: string;
    id_empresa: number;
  }[] = [];
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Número de elementos por página

  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.webSocketService.connect('ws://localhost:8080/ws'); // URL del servidor WebSocket
    if (this.webSocketService['socket']) {
      this.webSocketService['socket'].onmessage = (event) => {
        const newImageUrl = event.data; // Recibir URL de nueva imagen
        // Aquí puedes actualizar tu lista de imágenes o la lógica que necesites
      };
    }

    this.http
      .get<
        {
          idOferta: number;
          descripcionOferta: string;
          fotoOferta: string;
          id_empresa: number;
        }[]
      >('http://localhost:8080/ofertas/todas')
      .subscribe({
        next: (data) => {
          this.ofertas = data.map((oferta) => ({
            idOferta: oferta.idOferta,
            descripcionOferta: oferta.descripcionOferta,
            fotoOferta: oferta.fotoOferta,
            id_empresa: oferta.id_empresa,
          }));
        },
        error: (error) => {
          console.error('Error al cargar las ofertas:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Desconectar al destruir el componente
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
