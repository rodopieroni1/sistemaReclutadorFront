import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-usuariocontrol',
  standalone: true, // Indica que este componente es independiente
  imports: [FormsModule], // Agrega FormsModule aquí
  templateUrl: './usuariocontrol.component.html',
  styleUrls: ['./usuariocontrol.component.css'],
})
export class UsuarioControlComponent {
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
  miFormulario: any;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

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
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (this.fotoSeleccionada.size > 5 * 1024 * 1024) {
      // 5 MB
      alert(
        'El archivo de la foto es demasiado grande. Máximo permitido: 5 MB'
      );
      return;
    }
    if (this.archivoSeleccionado.size > 5 * 1024 * 1024) {
      // 5 MB
      alert('El archivo del CV es demasiado grande. Máximo permitido: 5 MB');
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
      .post('http://localhost:8080/perfiles', formData, {
        observe: 'response', // Observa toda la respuesta HTTP
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open('Usuario creado satisfactoriamente', 'Cerrar', {
              duration: 3000,
            });
            // Notificar al componente padre que se deben recargar los datos
          }
        },
        error: (response) => {
          console.error('Error al crear el Usuario', response);
          this.snackBar.open('Error al crear el Usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }
}
