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
          console.log('Postulaciones:', data);
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

  reactivar(_t17: any) {
    throw new Error('Method not implemented.');
  }
  eliminar(_t17: any) {
    throw new Error('Method not implemented.');
  }
}
