import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from '../../environments/environment';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuariocontrol',
  standalone: true, // Indica que este componente es independiente
  imports: [FormsModule, MatIcon, RouterLink], // Agrega FormsModule y MatIcon aquí
  templateUrl: './usuariocontrol.component.html',
  styleUrls: ['./usuariocontrol.component.css'],
})
export class UsuarioControlComponent {
  @ViewChild('formUsuario') formUsuario!: NgForm;
  nuevoUsuario = {
    dni: '',
    nombre: '',
    direccion: '',
    email: '',
    telefono: '',
    clave: '',
    password: '',
  };

  fotoSeleccionada: File | null = null;
  archivoSeleccionado: File | null = null;
  confirmarPassword: string = '';
  isSubmitting = false;
  apiUrl = environment.local.urlApi;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  seleccionarArchivo(event: Event, tipo?: string): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (tipo === 'cv') {
      const extension = archivo.name
        .substring(archivo.name.lastIndexOf('.'))
        .toLowerCase();

      if (!['.pdf', '.doc', '.docx'].includes(extension)) {
        this.snackBar.open('Formato permitido: PDF, DOC o DOCX.', 'Cerrar', {
          duration: 4000,
        });
        input.value = '';
        this.archivoSeleccionado = null;
        return;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        this.snackBar.open('El CV no puede superar los 5 MB.', 'Cerrar', {
          duration: 4000,
        });
        input.value = '';
        this.archivoSeleccionado = null;
        return;
      }

      this.archivoSeleccionado = archivo;
    } else {
      this.fotoSeleccionada = archivo;
    }
  }

  crearUsuario(event: Event): void {
    event.preventDefault();
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    // Validar los campos obligatorios del perfil
    if (
      !this.nuevoUsuario.dni ||
      !this.nuevoUsuario.nombre ||
      !this.nuevoUsuario.direccion ||
      !this.nuevoUsuario.email ||
      !this.nuevoUsuario.telefono ||
      !this.nuevoUsuario.clave ||
      !this.nuevoUsuario.password ||
      !this.fotoSeleccionada
    ) {
      this.snackBar.open('Por favor, completa todos los campos.', 'Cerrar', {
        duration: 4000,
      });
      this.isSubmitting = false;
      return;
    }

    // Validar tamaño de la foto
    if (this.fotoSeleccionada.size > 5 * 1024 * 1024) {
      this.snackBar.open(
        'El archivo de la foto es demasiado grande. Máximo permitido: 5 MB',
        'Cerrar',
        { duration: 4000 },
      );

      this.isSubmitting = false;
      return;
    }

    // Validar contraseña
    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      this.snackBar.open(
        'Las contraseñas no coinciden. Por favor, vuelve a ingresarlas.',
        'Cerrar',
        { duration: 4000 },
      );

      this.isSubmitting = false;
      return;
    }

    // Crear FormData
    const formData = new FormData();

    formData.append('dni', this.nuevoUsuario.dni);
    formData.append('nombre', this.nuevoUsuario.nombre);
    formData.append('direccion', this.nuevoUsuario.direccion);
    formData.append('email', this.nuevoUsuario.email);
    formData.append('telefono', this.nuevoUsuario.telefono);
    formData.append('clave', this.nuevoUsuario.clave);
    formData.append('password', this.nuevoUsuario.password);
    formData.append('foto', this.fotoSeleccionada);

    if (this.archivoSeleccionado) {
      formData.append('uploadcv', this.archivoSeleccionado);
    }

    this.http
      .post(this.apiUrl + '/perfiles', formData, {
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open(
              'Perfil creado satisfactoriamente. Ahora podés iniciar sesión.',
              'Cerrar',
              { duration: 6000 },
            );

            this.limpiarFormulario();
          }

          this.isSubmitting = false;
        },
        error: (response) => {
          const errorMsg =
            response.error?.message || 'Error al crear el perfil';

          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 3000,
          });

          this.isSubmitting = false;
        },
      });
  }

  limpiarFormulario(): void {
    this.formUsuario.resetForm();

    this.nuevoUsuario = {
      dni: '',
      nombre: '',
      direccion: '',
      email: '',
      telefono: '',
      clave: '',
      password: '',
    };

    this.confirmarPassword = '';
    this.fotoSeleccionada = null;

    const fotoInput = document.getElementById('foto') as HTMLInputElement;

    if (fotoInput) {
      fotoInput.value = '';
    }

    this.archivoSeleccionado = null;

    const cvInput = document.getElementById('cv') as HTMLInputElement;
    if (cvInput) {
      cvInput.value = '';
    }
  }
}
