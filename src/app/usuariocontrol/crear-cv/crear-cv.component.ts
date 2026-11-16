import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

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
  generandoCV = false;

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

  CrearCV(event: Event): void {
    event.preventDefault();
    if (this.generandoCV) {
      return;
    }
    const id = Number(sessionStorage.getItem('idPerfil'));
    const experienciaInvalida = this.experiencias.some(
      (experiencia) => !this.esFechaExperienciaValida(experiencia),
    );

    if (experienciaInvalida) {
      this.snackBar.open(
        'Revisá las fechas de tus experiencias laborales.',
        'Cerrar',
        { duration: 4000 },
      );
      return;
    }

    if (!id) {
      this.snackBar.open(
        'No se pudo identificar el perfil del postulante.',
        'Cerrar',
        { duration: 4000 },
      );
      return;
    }

    const request = {
      observaciones: this.observaciones,
      experiencias: this.experiencias,
      estudios: this.estudios,
    };

    this.generandoCV = true;

    this.http
      .post(`${this.apiUrl}/perfiles/${id}/generar-cv/docx`, request, {
        responseType: 'blob',
      })
      .pipe(
        finalize(() => {
          this.generandoCV = false;
        }),
      )
      .subscribe({
        next: (archivo: Blob) => {
          const url = window.URL.createObjectURL(archivo);
          const enlace = document.createElement('a');

          enlace.href = url;
          enlace.download = 'mi-cv.docx';
          enlace.click();

          window.URL.revokeObjectURL(url);

          this.snackBar.open(
            '¡Tu CV se generó y descargó correctamente!',
            'Cerrar',
            { duration: 5000 },
          );
        },

        error: (error) => {
          this.snackBar.open(
            'No se pudo generar el CV. ' +
              'Es posible que ya tengas uno registrado.',
            'Cerrar',
            { duration: 5000 },
          );

          console.error('Error al generar CV:', error);
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

  obtenerMesActual(): string {
    return new Date().toISOString().slice(0, 7);
  }

  esFechaExperienciaValida(experiencia: ExperienciaLaboral): boolean {
    if (!experiencia.fechaInicio || !experiencia.fechaFin) {
      return true;
    }

    return experiencia.fechaFin >= experiencia.fechaInicio;
  }
}
