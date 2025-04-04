import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
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
  ofertas: {
    idOferta: number;
    descripcion: string;
    foto: string;
    idEmpresa: number;
  }[] = [];
  @Output() datosActualizadosOferta = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() empresa: {
    idOferta: number;
    descripcion: string;
    foto: string;
    idEmpresa: number;
  } = {
    idOferta: 1,
    descripcion: '',
    foto: '',
    idEmpresa: 1,
  };
  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any }
  ) {
    this.miFormulario = this.fb.group({
      idOferta: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      descripcionOferta: ['', Validators.required],
      fotoOferta: ['', Validators.required],
      idEmpresa: ['', [Validators.required]],
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
    this.ofertas = data.oferta || null; // Recibe la empresa si es actualización
  }

  ngOnInit(): void {
    if (this.ofertas && Object.keys(this.ofertas).length > 0) {
      // Asignar los valores de la empresa al formulario
      this.miFormulario.patchValue({
        idOferta: this.data.oferta?.idOferta || 0,
        descripcionOferta: this.data.oferta?.descripcionOferta || '',
        fotoOferta: this.data.oferta?.fotoOferta || '',
        id_empresa: this.data.oferta?.id_empresa || 0,
      });
    }
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
            // Notificar al componente padre que se deben recargar los datos
            this.datosActualizadosOferta.emit();
            this.miFormulario.reset();
          }
        },
        error: () => {
          this.snackBar.open('Error al crear la oferta.', 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
