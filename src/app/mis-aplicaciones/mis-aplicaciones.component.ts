import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisAplicacionesServiceService } from './mis-aplicaciones-service.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-aplicaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-aplicaciones.component.html',
  styleUrl: './mis-aplicaciones.component.css',
})
export class MisAplicacionesComponent implements OnInit {
  [x: string]: any;
  postulaciones: any[] = [];
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
        },
        error: (error) => {
          console.error('Error al obtener postulaciones', error);
        },
      });
    } else {
      console.error('No hay idPerfil en sesión');
    }
  }

  EliminarPostulaciones(event: Event, post: any): void {
    event.stopPropagation();
    const actualizado = {
      ...post,
      estado: false,
      idPerfil: post.idPerfil,
      idOferta: post.idOferta,
    };
    this.aplicacionService
      .actualizarPostulacionesEstado(post.idaplicacion, actualizado.estado)
      .subscribe({
        next: () => {
          post.estado = false;
          console.log('Postulaciones Eliminada');
        },
        error: (error) => {
          console.error('Error al eliminar postulacion', error);
        },
      });
  }

  ReactivarPostulaciones(event: Event, post: any): void {
    event.stopPropagation();
    const actualizado = {
      ...post,
      estado: true,
      idPerfil: post.idPerfil,
      idOferta: post.idOferta,
    };
    this.aplicacionService
      .actualizarPostulacionesEstado(post.idaplicacion, actualizado.estado)
      .subscribe({
        next: () => {
          post.estado = true;
          console.log('Postulaciones reactivadas');
        },
        error: (error) => {
          console.error('Error al reactivar postulaciones', error);
        },
      });
  }

  verDetalle(post: any): void {
    console.log(
      '1. Clic en la postulación. Buscando datos completos para id:',
      post.idOferta,
    );

    this.aplicacionService.obtenerPerfilPostulaciones(post.idOferta).subscribe({
      next: (datosOfertaCompleta: any) => {
        console.log(
          '2. ¡Datos de la oferta recuperados del servidor!',
          datosOfertaCompleta,
        );
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
