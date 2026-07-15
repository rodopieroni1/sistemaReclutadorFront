import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserServiceService } from '../perfil/user-service.service';

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
  imports: [CommonModule, FormsModule, RouterModule],
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
      tipo === 'foto' ? (this.foto = file) : (this.cv = file);
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
      formData.append(key, (this.usuario as any)[key]);
    }
    if (this.foto) formData.append('foto', this.foto);
    if (this.cv) formData.append('uploadcv', this.cv);
    const id = Number(sessionStorage.getItem('idPerfil'));
    this.usuarioService.updateUsuario(id, formData).subscribe({
      next: () => {
        alert('Usuario actualizado correctamente');
        this.router.navigate(['/editar-perfil']);
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        alert('Hubo un problema al guardar los cambios');
      },
    });
  }
}
