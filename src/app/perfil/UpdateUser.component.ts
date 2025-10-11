import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserServiceService } from '../loginuser/user-service.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(sessionStorage.getItem('idPerfil')); // o extraído desde el token
    if (id) {
      this.http.get<Usuario>(`http://localhost:8080/perfiles/${id}`).subscribe({
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
          console.log('USUARIO', this.usuario);
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
    const formData = new FormData();
    for (const key in this.usuario) {
      formData.append(key, (this.usuario as any)[key]);
    }
    if (this.foto) formData.append('foto', this.foto);
    if (this.cv) formData.append('cv', this.cv);
    const id = Number(sessionStorage.getItem('idPerfil'));
    console.log('ID del usuario:', id);
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
