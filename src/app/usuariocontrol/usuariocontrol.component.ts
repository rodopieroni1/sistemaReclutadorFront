import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-usuariocontrol',
  standalone: true, // Indica que este componente es independiente
  imports: [FormsModule], // Agrega FormsModule aquí
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
    clave: '',
    password: '',
  };

  fotoSeleccionada: File | null = null;
  archivoSeleccionado: File | null = null;
  datosActualizadosOferta: any;
  confirmarPassword: string = '';
  isSubmitting = false;
  apiUrl = environment.local.urlApi;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  seleccionarArchivo(event: any, tipo: string): void {
    const archivo = event.target.files[0];
    if (tipo === 'foto') {
      this.fotoSeleccionada = archivo;
    } else if (tipo === 'cv') {
      this.archivoSeleccionado = archivo;
    }
  }

  crearUsuario(event: Event): void {
    event.preventDefault();
    if (this.isSubmitting) return; // Evita doble envío
    this.isSubmitting = true;
    // Validar que todos los campos están completos
    if (
      !this.nuevoUsuario.dni ||
      !this.nuevoUsuario.nombre ||
      !this.nuevoUsuario.direccion ||
      !this.nuevoUsuario.email ||
      !this.nuevoUsuario.clave ||
      !this.nuevoUsuario.password ||
      !this.fotoSeleccionada ||
      !this.archivoSeleccionado
    ) {
      this.snackBar.open('Por favor, completa todos los campos.', 'Cerrar', {
        duration: 4000,
      });

      this.isSubmitting = false;
      return;
    }
    if (this.fotoSeleccionada.size > 5 * 1024 * 1024) {
      this.snackBar.open(
        'El archivo de la foto es demasiado grande. Máximo permitido: 5 MB',
        'Cerrar',
        {
          duration: 4000,
        },
      );

      this.isSubmitting = false;
      return;
    }
    if (this.archivoSeleccionado.size > 5 * 1024 * 1024) {
      this.snackBar.open(
        'El archivo del CV es demasiado grande. Máximo permitido: 5 MB',
        'Cerrar',
        {
          duration: 4000,
        },
      );
      this.isSubmitting = false;
      return;
    }

    const password = this.nuevoUsuario.password;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      this.snackBar.open(
        'La contraseña debe tener al menos 6 caracteres e incluir letras y números.',
        'Cerrar',
        {
          duration: 4000,
        },
      );

      this.isSubmitting = false;
      return;
    }

    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      this.snackBar.open(
        'Las contraseñas no coinciden. Por favor, vuelve a ingresarlas.',
        'Cerrar',
        {
          duration: 4000,
        },
      );
      this.isSubmitting = false;
      return;
    }

    // Crear un FormData para enviar los datos
    const formData = new FormData();
    formData.append('dni', this.nuevoUsuario.dni);
    formData.append('nombre', this.nuevoUsuario.nombre);
    formData.append('direccion', this.nuevoUsuario.direccion);
    formData.append('email', this.nuevoUsuario.email);
    formData.append('clave', this.nuevoUsuario.clave);
    formData.append('password', this.nuevoUsuario.password);
    formData.append('foto', this.fotoSeleccionada);
    formData.append('uploadcv', this.archivoSeleccionado);
    // Mostrar todos los valores en la consola
    formData.forEach((value, key) => {
      if (!value) {
        console.error(`El valor del campo ${key} es inválido.`);
      }
    });

    // Realizar la solicitud HTTP POST
    this.http
      .post(this.apiUrl + '/perfiles', formData, {
        observe: 'response', // Observa toda la respuesta HTTP
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open('Usuario creado satisfactoriamente', 'Cerrar', {
              duration: 6000,
            });
            // Notificar al componente padre que se deben recargar los datos
            this.limpiarFormulario();
            this.isSubmitting = false; // Restablecer el estado de envío
            this.formUsuario.reset(); // Resetea valores y estado de validación
          }
        },
        error: (response) => {
          const errorMsg = response.error?.error || 'Error al crear el Usuario';
          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 3000,
          });
          this.isSubmitting = false; // 🔓 desbloquear el botón
        },
      });
  }

  limpiarFormulario(): void {
    this.formUsuario.resetForm(); // 🔄 limpia valores y estado visual
    this.nuevoUsuario = {
      dni: '',
      nombre: '',
      direccion: '',
      email: '',
      clave: '',
      password: '',
    };
    this.confirmarPassword = '';
    this.fotoSeleccionada = null;
    this.archivoSeleccionado = null;

    // Resetear los inputs de archivo manualmente
    const fotoInput = document.getElementById('foto') as HTMLInputElement;
    const cvInput = document.getElementById('cv') as HTMLInputElement;
    if (fotoInput) fotoInput.value = '';
    if (cvInput) cvInput.value = '';
  }
}
