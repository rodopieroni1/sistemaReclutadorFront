import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
export class ModalNuevaOfertaComponent implements OnInit {
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
  archivoSeleccionado: File | null = null; // Archivo subido
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,

    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any }
  ) {
    this.miFormulario = this.fb.group({
      descripcionOferta: ['', Validators.required],
      fotoOferta: [null, Validators.required],
      idEmpresa: ['', Validators.required], // Este debe coincidir con formControlName en HTML
      idOferta: [''],
    });
    this.accion = data.accion; // Recibe
    //  la acción (crear o actualizar)
    this.ofertas = data.oferta || null; // Recibe la empresa si es actualización
  }

  ngOnInit(): void {
    this.obtenerEmpresas();
    if (this.data.oferta) {
      // Carga la oferta seleccionada para modificación
      this.http
        .get<any>(`http://localhost:8080/ofertas/${this.data.oferta.idOferta}`)
        .subscribe({
          next: () => {
            this.miFormulario.patchValue({
              descripcionOferta: this.data.oferta.descripcionOferta || '',
              fotoOferta: this.data.oferta.fotoOferta || '',
              idEmpresa: this.data.oferta.empresa?.id_empresa || '', // Asigna la empresa asignada previamente
            });
          },
          error: () => {
            this.snackBar.open(
              'Error al cargar la oferta para modificar.',
              'Cerrar',
              {
                duration: 3000,
              }
            );
          },
        });
    } else {
      this.miFormulario.patchValue({
        descripcionOferta: this.data.oferta?.descripcionOferta || '',
        fotoOferta: this.data.oferta?.fotoOferta || '',
        idEmpresa: this.data.oferta.empresa?.id_empresa || '', // Asigna la empresa asignada previamente
      });
    }
  }

  // Método para obtener empresas desde el backend
  obtenerEmpresas(): void {
    this.http.get<any[]>('http://localhost:8080/empresas').subscribe({
      next: (data: any[]) => {
        this.empresas = data; // Asegúrate de asignar los datos correctamente
        console.log('DATA: ', this.empresas);
      },
      error: (err) => {
        this.snackBar.open('Error al cargar las empresas.', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  guardar(): void {
    if (this.miFormulario.invalid) {
      this.snackBar.open(
        'Por favor, completa todos los campos antes de guardar.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    if (this.accion === 'crear') {
      const idEmpresa = this.miFormulario.value.idEmpresa;
      // Realiza el GET para obtener la información de la empresa
      this.http
        .get<any>(`http://localhost:8080/empresas/existeId/${idEmpresa}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .subscribe({
          next: (empresa) => {
            // Completa los valores faltantes en el formulario
            const oferta = {
              descripcionOferta: this.miFormulario.value.descripcionOferta,
              fotoOferta: this.miFormulario.value.fotoOferta.name,
              empresa: {
                id_empresa: idEmpresa, // Usar el valor del backend
                nombre: empresa.nombre, // Valor obtenido del backend
                cuit: empresa.cuit, // Valor obtenido del backend
                email: empresa.email || 'correo@correo', // Valor obtenido del backend
                observaciones: empresa.observacionesEmpresa, // Valor obtenido del backend
                direccionEmpresa: empresa.direccion, // Valor obtenido del backend
                historia_empresa: empresa.historiaEmpresa, // Valor obtenido del backend
              },
              idOferta: this.miFormulario.value.idOferta,
            };
            // Enviar el objeto oferta al backend
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
                    this.snackBar.open(
                      'Oferta creada satisfactoriamente',
                      'Cerrar',
                      { duration: 3000 }
                    );
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
          },
          error: () => {
            this.snackBar.open(
              'Error al obtener información de la empresa.',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
    } else {
      ////AQUI EMPIEZA EL MODIFICAR
      const idEmpresa = this.miFormulario.value.idEmpresa;
      // Realiza el GET para obtener la información de la empresa
      this.http
        .get<any>(`http://localhost:8080/empresas/existeId/${idEmpresa}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .subscribe({
          next: (empresa) => {
            // Completa los valores faltantes en el formulario
            console.log('EMPRESA1: ', empresa);

            this.cargarUpdate(this.miFormulario, empresa);
            this.dialogRef.close(); // Cierra el modal sin acción
          },
          error: () => {
            this.snackBar.open(
              'Error al obtener información de la empresa.',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
    }
  }

  cargarUpdate(oferta: any, empresa: any) {
    const idOferta =
      this.miFormulario.value.idOferta || this.data.oferta.idOferta;
    const idEmpresa = this.miFormulario.value.idEmpresa;
    if (!oferta.value.idEmpresa) {
      console.error('Error: idEmpresa está vacío en la oferta.');
      this.snackBar.open('Error: idEmpresa está vacío.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    //ver aqui com
    oferta = {
      descripcionOferta: this.miFormulario.value.descripcionOferta,
      fotoOferta: this.miFormulario.value.fotoOferta.nombre,
      empresa: {
        id_empresa: idEmpresa, // Usar el valor del backend
      },
      idOferta: idOferta,
    };
    this.http
      .put(`http://localhost:8080/ofertas/actualizar/${idOferta}`, oferta, {
        headers: { 'Content-Type': 'application/json' },
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open(
              'Empresa actualizada satisfactoriamente',
              'Cerrar',
              { duration: 3000 }
            );
            this.datosActualizadosOferta.emit();
          }
          this.miFormulario.reset();
        },
        error: () => {
          this.snackBar.open(
            'Error al actualizar la Oferta. Inténtelo nuevamenteee.',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
  }

  // Método para manejar el evento de selección del archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      if (archivo.type.startsWith('image/')) {
        this.miFormulario.patchValue({
          fotoOferta: archivo,
        });
        this.miFormulario.get('fotoOferta')?.updateValueAndValidity();
      } else {
        this.snackBar.open('Solo se permiten archivos de imagen.', 'Cerrar', {
          duration: 3000,
        });
      }
    }
  }
  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
