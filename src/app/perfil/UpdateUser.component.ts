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
import { UbicacionService } from '../ubicacion.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
interface Usuario {
  dni: string;
  nombre: string;
  direccion: string;
  localidad: string;
  provincia: string;
  pais: string;
  email: string;
  telefono: string;
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
    MatIcon,
    MatSelectModule,
    MatOptionModule,
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
    localidad: '',
    provincia: '',
    pais: '',
    email: '',
    telefono: '',
    clave: '',
    documentoUrl: null,
    fotoUrl: null,
  };
  foto: File | null = null;
  cv: File | null = null;
  paises: any[] = [];
  provincias: any[] = [];
  localidades: string[] = [];

  constructor(
    private usuarioService: UserServiceService,
    private router: Router,
    private http: HttpClient,
    private loginService: LoginService,
    private ubicacionService: UbicacionService,
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
            localidad: data.localidad ?? '',
            provincia: data.provincia ?? '',
            pais: data.pais ?? '',
            email: data.email ?? '',
            telefono: data.telefono ?? '',
            clave: data.clave ?? '',
            documentoUrl: data.documentoUrl,
            fotoUrl: data.fotoUrl,
          };
          this.cargarUbicacionGuardada(data.pais, data.provincia);
        },
        error: (err) => {
          alert('No se pudo cargar la información del usuario');
        },
      });
    }

    this.ubicacionService.getPaises().subscribe({
      next: (respuesta) => {
        this.paises = respuesta.data;
      },
      error: (error) => console.error('Error al cargar países:', error),
    });
  }

  cargarUbicacionGuardada(pais: string, provincia: string): void {
    if (!pais) return;

    this.ubicacionService.getProvincias(pais).subscribe({
      next: (respuesta) => {
        this.provincias = respuesta.data.states || [];
        if (!provincia) return;
        this.ubicacionService.getLocalidades(pais, provincia).subscribe({
          next: (respuestaLocalidades) => {
            this.localidades = respuestaLocalidades.data || [];
          },
          error: (error) =>
            console.error('Error al cargar localidades:', error),
        });
      },
      error: (error) => console.error('Error al cargar provincias:', error),
    });
  }

  alCambiarPais(): void {
    const pais = this.usuario.pais;
    this.usuario.provincia = '';
    this.usuario.localidad = '';
    this.provincias = [];
    this.localidades = [];
    if (!pais) return;
    this.ubicacionService.getProvincias(pais).subscribe({
      next: (respuesta) => {
        this.provincias = respuesta.data.states || [];
      },
      error: (error) => console.error('Error al cargar provincias:', error),
    });
  }

  alCambiarProvincia(): void {
    const pais = this.usuario.pais;
    const provincia = this.usuario.provincia;
    this.usuario.localidad = '';
    this.localidades = [];
    if (!pais || !provincia) return;
    this.ubicacionService.getLocalidades(pais, provincia).subscribe({
      next: (respuesta) => {
        this.localidades = respuesta.data || [];
      },
      error: (error) => console.error('Error al cargar localidades:', error),
    });
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
    console.log('Ubicación enviada:', {
      pais: formData.get('pais'),
      provincia: formData.get('provincia'),
      localidad: formData.get('localidad'),
    });
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
              localidad: data.localidad ?? '',
              provincia: data.provincia ?? '',
              pais: data.pais ?? '',
              email: data.email ?? '',
              telefono: data.telefono ?? '',
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
