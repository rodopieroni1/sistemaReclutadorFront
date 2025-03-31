import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'; // Si usas botones de Angular Material
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'; // Importar FormsModule para usar [(ngModel)]
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-modal-nueva-empresa',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './modal-nueva-empresa.component.html',
  styleUrls: ['./modal-nueva-empresa.component.css'], // Corregido
  providers: [],
})
export class ModalNuevaEmpresaComponent {
  nombreEmpresa: string = '';
  direccionEmpresa: string = '';
  historiaEmpresa: string = '';
  observacionesEmpresa: string = '';
  emailEmpresa: string = '';
  cuitEmpresa: number = 1;

  miFormulario: FormGroup;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.miFormulario = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      direccionEmpresa: ['', Validators.required],
      historiaEmpresa: ['', Validators.required],
      observacionesEmpresa: [''],
      emailEmpresa: ['', [Validators.required, Validators.email]],
      cuitEmpresa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
  }

  guardar() {
    // Validar que todos los campos necesarios no estén vacíos
    if (this.miFormulario.valid) {
      if (!this.miFormulario.value.cuitEmpresa) {
        this.snackBar.open(
          'Por favor, completa todos los campos antes hde guardar.',
          'Cerrar',
          {
            duration: 3000, // Duración en milisegundos
          }
        );
        return; // Salir de la función si hay campos vacíos
      }

      if (this.miFormulario.value.cuitEmpresa === 1) {
        this.snackBar.open(
          'El CUIT debe ser distinto a existentes.',
          'Cerrar',
          {
            duration: 3000,
          }
        );
        return; // Salir de la función si el CUIT es inválido
      }

      // Validar que el CUIT no exista en la base de datos
      this.http
        .get<boolean>(
          `http://localhost:8080/empresas/existe/${this.miFormulario.value.cuitEmpresa}`
        )
        .subscribe({
          next: (existe: boolean) => {
            if (existe) {
              this.snackBar.open(
                'El CUIT ingresado ya existe. Por favor, utiliza otro.',
                'Cerrar',
                {
                  duration: 3000,
                }
              );
              return; // Salir de la función si el CUIT ya está registrado
            }
            // Si el CUIT no existe, crea la empresa
            const empresa = {
              nombre: this.miFormulario.value.nombreEmpresa,
              direccion: this.miFormulario.value.direccionEmpresa,
              historia: this.miFormulario.value.historiaEmpresa,
              observaciones: this.miFormulario.value.observacionesEmpresa,
              cuit: this.miFormulario.value.cuitEmpresa,
              email: this.miFormulario.value.emailEmpresa,
            };
            this.http
              .post('http://localhost:8080/empresas/crear', empresa, {
                headers: {
                  'Content-Type': 'application/json',
                },
                observe: 'response', // Observa toda la respuesta HTTP
              })
              .subscribe({
                next: (response) => {
                  if (response.status === 201 || response.status === 200) {
                    this.snackBar.open(
                      'Empresa creada satisfactoriamente',
                      'Cerrar',
                      {
                        duration: 3000,
                      }
                    );
                  }
                  this.miFormulario.reset();
                },
                error: (err) => {
                  this.snackBar.open(
                    'Error al crear la empresa. Inténtelo nuevamente.',
                    'Cerrar',
                    {
                      duration: 3000,
                    }
                  );
                },
              });
          },
          error: (err) => {
            this.snackBar.open(
              'Error al verificar el CUIT. Inténtelo nuevamente.',
              'Cerrar',
              {
                duration: 3000,
              }
            );
          },
        });
    } else {
      this.snackBar.open(
        'Por favor, completa todos los campos antes',
        'Cerrar',
        {
          duration: 3000, // Duración en milisegundos
        }
      );
    }
  }

  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
