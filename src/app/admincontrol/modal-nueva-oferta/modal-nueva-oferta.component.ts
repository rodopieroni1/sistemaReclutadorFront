import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'; // Si usas botones de Angular Material
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms'; // Importar FormsModule para usar [(ngModel)]
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ModalNuevaEmpresaComponent } from '../modal-nueva-empresa/modal-nueva-empresa.component';
@Component({
  selector: 'app-modal-nueva-oferta',
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
    MatExpansionModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './modal-nueva-oferta.component.html',
  styleUrl: './modal-nueva-oferta.component.css',
})
export class ModalNuevaOfertaComponent {
  [x: string]: any;
  descripcionOferta: string = '';
  fotoOferta: string = '';
  idEmpresa: number = 1;
  miFormulario: FormGroup;
  empresas: any[] = [];

  ngOnInit(): void {
    this.http
      .get<{ idEmpresa: number; nombre: string }[]>(
        'http://localhost:8080/empresas'
      )
      .subscribe((data) => {
        this.empresas = data;
      });
  }
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.miFormulario = this.fb.group({
      descripcionOferta: ['', Validators.required],
      fotoOferta: ['', Validators.required],
      idEmpresa: ['', [Validators.required]],
    });
  }

  guardar() {
    const oferta = {
      descripcionOferta: this.miFormulario.value.descripcionOferta,
      fotoOferta: this.miFormulario.value.fotoOferta,
      idEmpresa: this.miFormulario.value.idEmpresa,
    };

    this.http
      .post('http://localhost:8080/ofertas/crear', oferta, {
        headers: {
          'Content-Type': 'application/json',
        },
        observe: 'response', // Observa toda la respuesta HTTP
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open('Oferta creada satisfactoriamente', 'Cerrar', {
              duration: 3000,
            });

            // Recargar los datos actualizados
            this.cargarEmpresas();
          }
          this.miFormulario.reset();
        },
        error: (error) => {
          console.error('Error al crear la oferta:', error);
          this.snackBar.open('Error al crear la oferta.', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  cargarEmpresas() {
    this.http
      .get<{ idEmpresa: number; nombre: string }[]>(
        'http://localhost:8080/empresas'
      )
      .subscribe({
        next: (data) => {
          this.empresas = data; // Actualiza el arreglo local con los nuevos datos
          console.log('Empresas actualizadas:', this.empresas);
        },
        error: (error) => {
          console.error('Error al cargar las empresas:', error);
        },
      });
  }
  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
