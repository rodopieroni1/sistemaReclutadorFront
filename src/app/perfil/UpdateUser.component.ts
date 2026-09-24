import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserServiceService } from '../perfil/user-service.service';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import { MatIcon } from '@angular/material/icon';
import { LoginService } from '../loginuser/auth/login.service';

interface Usuario {
  dni: string;
  nombre: string;
  direccion: string;
  email: string;
  clave: string;
  documentoUrl: string | null;
  fotoUrl: string | null;
}

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CabeceraComponent,
    MatIcon,
  ],
  templateUrl: './UpdateUser.component.html',
  styleUrls: ['./UpdateUser.component.css'],
})
export class UpdateUserComponent implements OnInit {
  [x: string]: any;
  urlApi = environment.local.urlApi;
  usuario: Usuario = {
    dni: '',
    nombre: '',
    direccion: '',
    email: '',
    clave: '',
    documentoUrl: null,
    fotoUrl: null,
  };
  foto: File | null = null;
  cv: File | null = null;

  constructor(
    private usuarioService: UserServiceService,
    private router: Router,
    private http: HttpClient,
    private loginService: LoginService,
  ) {}

  ngOnInit(): void {
    this.foto = null;
    this.cv = null;
    const id = Number(sessionStorage.getItem('idPerfil')); // o extraído desde el token
    if (id) {
      this.http.get<Usuario>(`${this.urlApi}/perfiles/${id}`).subscribe({
        next: (data: Usuario) => {
          this.usuario = {
            dni: data.dni ?? '',
            nombre: data.nombre ?? '',
            direccion: data.direccion ?? '',
            email: data.email ?? '',
            clave: data.clave ?? '',
            documentoUrl: data.documentoUrl,
            fotoUrl: data.fotoUrl,
          };
        },
        error: (err) => {
          alert('No se pudo cargar la información del usuario');
        },
      });
    }
  }

  seleccionarArchivo(event: Event, tipo: 'foto' | 'cv') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (tipo === 'foto') {
        this.foto = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.usuario.fotoUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.cv = file;
      }
    }
  }

  actualizarUsuario(event: Event) {
    event.preventDefault();
    // 2. Construcción del FormData
    const formData = new FormData();
    for (const key in this.usuario) {
      if (key !== 'fotoUrl') {
        formData.append(key, (this.usuario as any)[key]);
      }
    }

    if (this.foto) {
      formData.append('foto', this.foto);
    }

    if (this.cv) {
      formData.append('uploadcv', this.cv);
    }

    const id = Number(sessionStorage.getItem('idPerfil'));
    this.usuarioService.updateUsuario(id, formData).subscribe({
      //llamo al backend
      next: (respuesta: any) => {
        alert('Usuario actualizado correctamente');
        this.http.get<Usuario>(`${this.urlApi}/perfiles/${id}`).subscribe({
          next: (data: Usuario) => {
            this.usuario = {
              dni: data.dni ?? '',
              nombre: data.nombre ?? '',
              direccion: data.direccion ?? '',
              email: data.email ?? '',
              clave: data.clave ?? '',
              documentoUrl: data.documentoUrl,
              fotoUrl: data.fotoUrl,
            };

            // Actualizamos la foto que utiliza la cabecera
            if (data.fotoUrl) {
              this.loginService.actualizarFotoPerfil(data.fotoUrl);
            }

            this.usuarioService.notificarCambioPerfil(this.usuario);

            this.foto = null;
            this.cv = null;
          },

          error: (err) => {
            console.error('Error al obtener el perfil actualizado:', err);
          },
        });
      },

      // =========================
      // BACKEND RESPONDE ERROR
      // =========================
      error: (err) => {
        const mensaje =
          err.message || 'Ocurrió un error al actualizar el usuario..';

        alert(mensaje);
      },
    });
  }

  obtenerUrlFoto(fotoUrl: string | null): string {
    if (!fotoUrl) {
      return 'assets/default-profile.png';
    }
    if (fotoUrl.startsWith('data:') || fotoUrl.startsWith('http')) {
      return fotoUrl;
    }
    return `${this.urlApi}${fotoUrl}`;
  }

  obtenerUrlCv(documentoUrl: string | null): string | null {
    if (!documentoUrl) {
      return null;
    }
    if (documentoUrl.startsWith('http')) {
      return documentoUrl;
    }
    const nombreArchivo = documentoUrl.split('?')[0];
    return `${this.urlApi}/uploads/documentos/${nombreArchivo}`;
  }
}
