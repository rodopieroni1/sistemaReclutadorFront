import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserServiceService } from '../perfil/user-service.service';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import { MatIcon } from '@angular/material/icon';

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
  ) {}

  ngOnInit(): void {
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
          console.error('Error al cargar perfil:', err);
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

        // Crear una previsualización local inmediata de la imagen
        const reader = new FileReader();
        reader.onload = () => {
          this.usuario.fotoUrl = reader.result as string; // Esto actualiza el <img [src]> en tiempo real
        };
        reader.readAsDataURL(file);
      } else {
        this.cv = file;
      }
    }
  }

  actualizarUsuario(event: Event) {
    event.preventDefault();
    const errores = this.usuarioService.validarUsuario(
      this.usuario,
      this.foto,
      this.cv,
    );
    if (errores.length > 0) {
      alert(errores.join('\n'));
      return;
    }

    const formData = new FormData();
    for (const key in this.usuario) {
      // Evitamos enviar la fotoUrl vieja o en base64 corrupta como texto al backend
      if (key !== 'fotoUrl') {
        formData.append(key, (this.usuario as any)[key]);
      }
    }

    if (this.foto) formData.append('foto', this.foto);
    if (this.cv) formData.append('uploadcv', this.cv);

    const id = Number(sessionStorage.getItem('idPerfil'));
    this.usuarioService.updateUsuario(id, formData).subscribe({
      next: (respuesta: any) => {
        alert('Usuario actualizado correctamente');

        // Si tu backend te devuelve la nueva URL de la imagen en la respuesta, úsala.
        // Si no te la devuelve, le añadimos un parámetro aleatorio (?v=fecha) a la URL actual para limpiar la caché del navegador:
        if (this.usuario.fotoUrl && !this.usuario.fotoUrl.startsWith('data:')) {
          const timestamp = new Date().getTime();
          const separador = this.usuario.fotoUrl.includes('?') ? '&' : '?';
          this.usuario.fotoUrl = `${this.usuario.fotoUrl.split('?')[0]}${separador}v=${timestamp}`;
        }

        this.usuarioService.notificarCambioPerfil(this.usuario);
        this.foto = null;
        this.cv = null;
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        alert('Hubo un problema al guardar los cambios');
      },
    });
  }
}
