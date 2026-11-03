import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

interface PerfilPostulante {
  dni: string;
  nombre: string;
  direccion: string;
  email: string;
  telefono: string;
  fotoUrl: string | null;
}

interface ExperienciaLaboral {
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
}

interface Estudio {
  institucion: string;
  titulo: string;
  estado: string;
  anio: string;
}

@Component({
  selector: 'app-crear-cv',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, RouterModule],
  templateUrl: './crear-cv.component.html',
  styleUrl: './crear-cv.component.css',
})
export class CrearCvComponent implements OnInit {
  apiUrl = environment.local.urlApi;

  perfil: PerfilPostulante = {
    dni: '',
    nombre: '',
    direccion: '',
    email: '',
    telefono: '',
    fotoUrl: null,
  };

  experiencias: ExperienciaLaboral[] = [
    {
      empresa: '',
      puesto: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: '',
    },
  ];

  estudios: Estudio[] = [
    {
      institucion: '',
      titulo: '',
      estado: '',
      anio: '',
    },
  ];

  observaciones = '';

  cargandoPerfil = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const id = Number(sessionStorage.getItem('idPerfil'));

    if (!id) {
      this.snackBar.open(
        'No se pudo identificar el perfil del postulante.',
        'Cerrar',
        { duration: 4000 },
      );
      return;
    }

    this.cargandoPerfil = true;

    this.http.get<PerfilPostulante>(`${this.apiUrl}/perfiles/${id}`).subscribe({
      next: (data) => {
        this.perfil = {
          dni: data.dni ?? '',
          nombre: data.nombre ?? '',
          direccion: data.direccion ?? '',
          email: data.email ?? '',
          telefono: data.telefono ?? '',
          fotoUrl: data.fotoUrl ?? null,
        };

        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;

        this.snackBar.open(
          'No se pudieron recuperar tus datos personales.',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }

  agregarExperiencia(): void {
    this.experiencias.push({
      empresa: '',
      puesto: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: '',
    });
  }

  eliminarExperiencia(index: number): void {
    this.experiencias.splice(index, 1);
  }

  agregarEstudio(): void {
    this.estudios.push({
      institucion: '',
      titulo: '',
      estado: '',
      anio: '',
    });
  }

  eliminarEstudio(index: number): void {
    this.estudios.splice(index, 1);
  }

  obtenerUrlFoto(fotoUrl: string | null): string {
    if (!fotoUrl) {
      return 'assets/default-profile.png';
    }

    if (fotoUrl.startsWith('data:') || fotoUrl.startsWith('http')) {
      return fotoUrl;
    }

    return `${this.apiUrl}${fotoUrl}`;
  }
}
