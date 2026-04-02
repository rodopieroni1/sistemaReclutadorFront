import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisAplicacionesServiceService } from './mis-aplicaciones-service.service';
@Component({
  selector: 'app-mis-aplicaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-aplicaciones.component.html',
  styleUrl: './mis-aplicaciones.component.css',
})
export class MisAplicacionesComponent implements OnInit {
  postulaciones: any[] = [];
  constructor(private aplicacionService: MisAplicacionesServiceService) {}

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

  EliminarPostulaciones(post: any) {
    const actualizado = { ...post, estado: false };
    this.aplicacionService
      .actualizarPostulacionesEstado(post.idaplicacion, actualizado)
      .subscribe({
        next: () => {
          console.log('Postulaciones Eliminada');
        },
        error: (error) => {
          console.error('Error al eliminar postulacion', error);
        },
      });
  }

  ReactivarPostulaciones(post: any) {
    const actualizado = { ...post, estado: true };
    this.aplicacionService
      .actualizarPostulacionesEstado(post.idaplicacion, actualizado)
      .subscribe({
        next: () => {
          console.log('Postulaciones reactivadas');
        },
        error: (error) => {
          console.error('Error al reactivar postulaciones', error);
        },
      });
  }
}
