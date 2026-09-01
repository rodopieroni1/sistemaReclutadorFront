import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisAplicacionesServiceService } from './mis-aplicaciones-service.service';
import { Router, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';

export interface Postulacion {
  idAplicacion?: number;
  id_aplicaciones?: number;
  id?: number;
  idPerfil?: number;
  idOferta?: number;
  puesto?: string;
  empresa?: string;
  fecha?: string | Date;
  estado: boolean;
}

@Component({
  selector: 'app-mis-aplicaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIcon, CabeceraComponent],
  templateUrl: './mis-aplicaciones.component.html',
  styleUrl: './mis-aplicaciones.component.css',
})
export class MisAplicacionesComponent implements OnInit {
  postulaciones: Postulacion[] = [];
  ofertas: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    empresa: { nombre: string };
  }[] = [];

  constructor(
    private aplicacionService: MisAplicacionesServiceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idPerfil = sessionStorage.getItem('idPerfil');
    if (idPerfil) {
      this.aplicacionService.obtenerPostulaciones(Number(idPerfil)).subscribe({
        next: (data) => {
          this.postulaciones = data;
          console.log('Estructura de postulaciones recibida:', data);
        },
        error: (error) => {
          console.error('Error al obtener postulaciones', error);
        },
      });
    } else {
      console.error('No hay idPerfil en sesión');
    }
  }

  EliminarPostulaciones(event: Event, post: Postulacion): void {
    event.stopPropagation();

    // Resuelve cuál es el campo con el ID activo de las propiedades
    const idPost = post.idAplicacion ?? post.id_aplicaciones ?? post.id;

    if (!idPost) {
      console.error('No se encontró un ID válido en la postulación:', post);
      return;
    }

    this.aplicacionService
      .actualizarPostulacionesEstado(idPost, false)
      .subscribe({
        next: () => {
          post.estado = false;
          console.log('Postulación eliminada/desactivada correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar postulación', error);
        },
      });
  }

  ReactivarPostulaciones(event: Event, post: Postulacion): void {
    event.stopPropagation();

    const idPost = post.idAplicacion ?? post.id_aplicaciones ?? post.id;

    if (!idPost) {
      console.error('No se encontró un ID válido en la postulación:', post);
      return;
    }

    this.aplicacionService
      .actualizarPostulacionesEstado(idPost, true)
      .subscribe({
        next: () => {
          post.estado = true;
          console.log('Postulación reactivada correctamente');
        },
        error: (error) => {
          console.error('Error al reactivar postulación', error);
        },
      });
  }

  verDetalle(post: Postulacion): void {
    if (!post.idOferta) {
      console.error('El idOferta de la postulación es indefinido:', post);
      return;
    }

    this.aplicacionService.obtenerPerfilPostulaciones(post.idOferta).subscribe({
      next: (datosOfertaCompleta: any) => {
        sessionStorage.setItem('ruta_procedencia', '/mis-aplicaciones');
        this.router.navigate(['/detalle-oferta'], {
          state: {
            oferta: datosOfertaCompleta,
          },
        });
      },
      error: (error) => {
        console.error(
          'Error al realizar la búsqueda parcializada de la oferta:',
          error,
        );
      },
    });
  }
}
