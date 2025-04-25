import {
  ChangeDetectorRef,
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
import { FileUploadService } from '../modal-nueva-oferta/file-upload-service.service';
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

  @Output() datosActualizadosOferta = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() oferta: {
    idOferta: number;
    descripcionOferta: string;
    fotoOferta: string;
    empresa: { id_empresa: number };
  } = {
    idOferta: 1,
    descripcionOferta: '',
    fotoOferta: '',
    empresa: { id_empresa: 0 },
  };
  fotoOfertaUrl: string = '';
  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  archivoSeleccionado: File | null = null; // Archivo subido
  archivoProcesado: boolean = false;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any }
  ) {
    this.miFormulario = this.fb.group({
      descripcionOferta: ['', Validators.required],
      fotoOferta: ['', Validators.required],
      idEmpresa: ['', Validators.required], // Este debe coincidir con formControlName en HTML
      idOferta: ['', Validators.required],
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
  }

  ngOnInit(): void {
    this.obtenerEmpresas();
    if (this.data.oferta) {
      // Carga la oferta seleccionada para modificación
      this.http
        .get<any>(
          `http://localhost:8080/ofertas/existeId/${this.data.oferta.idOferta}`
        )
        .subscribe({
          next: (response) => {
            this.miFormulario.patchValue({
              descripcionOferta: response.descripcionOferta || '',
              idEmpresa: response.empresa?.id_empresa || '', // Asigna la empresa asignada previamente
            }); // Para mantener la foto existente sin necesidad de subir un nuevo archivo
            if (response.fotoOferta) {
              this.archivoSeleccionado = new File(
                [response.fotoOferta],
                response.fotoOferta, // Nombre del archivo
                { type: 'image/jpeg' } // Ajusta el tipo si es diferente
              );
            }
            this.miFormulario.patchValue({
              fotoOferta: response.fotoOferta || '',
            });
          },
          error: (err) => {
            this.snackBar.open(
              'Error al cargar la oferta para modificar.',
              err,
              {
                duration: 3000,
              }
            );
          },
        });
    }

    // Suscripción para monitorear cambios en el formulario
    this.miFormulario.valueChanges.subscribe(() => {
      if (this.miFormulario.valid && !this.archivoProcesado) {
        this.activarFuncionCuandoFormularioEsValido();
      }
    });
  }
  activarFuncionCuandoFormularioEsValido(): void {
    console.log('Todos los campos están completos y válidos.');
    // Aquí puedes realizar cualquier acción, como habilitar el botón guardar automáticamente
    this.habilitarBotonGuardar();
  }

  habilitarBotonGuardar(): void {
    console.log('Botón habilitado.');
  }

  // Método para obtener empresas desde el backend
  obtenerEmpresas(): void {
    this.http.get<any[]>('http://localhost:8080/empresas').subscribe({
      next: (data: any[]) => {
        this.empresas = data; // Asegúrate de asignar los datos correctamente
      },
      error: (err) => {
        this.snackBar.open('Error al cargar las empresas.', err, {
          duration: 3000,
        });
      },
    });
  }

  guardar(): void {
    if (this.miFormulario.value.descripcionOferta === '') {
      this.snackBar.open('Agrege valores a la oferta.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const idEmpresa = this.miFormulario.value.idEmpresa;
    if (idEmpresa === '') {
      this.snackBar.open('Agrege valores a la oferta 2.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    if (this.accion === 'crear') {
      // Realiza el GET para obtener la información de la empresa
      this.http
        .get<any>(`http://localhost:8080/empresas/existeId/${idEmpresa}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .subscribe({
          next: (empresa) => {
            const oferta = {
              descripcionOferta: this.miFormulario.value.descripcionOferta,
              empresa: {
                id_empresa: empresa.id_empresa, // Usar el valor del backend
              }, // Agregar el objeto completo de empresa
              fotoOferta: this.archivoSeleccionado?.name,
              idOferta: this.miFormulario.value.idOferta || 0,
            };
            if (oferta.descripcionOferta === '') {
              this.snackBar.open('Agrege valores a la oferta 1.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }
            // Construir FormData para enviar archivo y datos
            const formData = new FormData();
            if (this.archivoSeleccionado) {
              formData.append('file', this.archivoSeleccionado); // Agregar el archivo solo si no es null
            } else {
              console.error('No hay archivo seleccionado.');
            }
            formData.append('oferta', JSON.stringify(oferta)); // Datos de la oferta
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
      if (idEmpresa === '' || idEmpresa === null) {
        this.snackBar.open('Agrege valores a la oferta 2.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
      // Realiza el GET para obtener la información de la empresa
      this.http
        .get<any>(`http://localhost:8080/empresas/existeId/${idEmpresa}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .subscribe({
          next: (response) => {
            const oferta = {
              descripcionOferta: this.miFormulario.value.descripcionOferta,
              empresa: {
                id_empresa: this.miFormulario.value.empresa, // Usar el valor del backend
              }, // Agregar el objeto completo de empresa
              fotoOferta: this.archivoSeleccionado?.name,
            };
            if (this.miFormulario.value.descripcionOferta === '') {
              console.error('Agrege valores a la oferta.', this.oferta);
              this.snackBar.open('Agrege valores a la oferta 1.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }
            if (response.empresa === '') {
              console.error('Agrege valores a la oferta.', this.oferta);
              this.snackBar.open('Agrege valores a la oferta 2.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }
            if (this.miFormulario.value.fotoOferta === '') {
              console.error('Agrege valores a la oferta.', this.oferta);
              this.snackBar.open('Agrege valores a la oferta 3.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }

            this.cargarUpdate(this.miFormulario, response);
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

  cargarUpdate(oferta: any, response: any) {
    const idOferta =
      this.miFormulario.value.idOferta || this.data.oferta.idOferta;
    const fotoOfertaFinal = response.fotoOferta;
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
      fotoOferta: this.archivoSeleccionado?.name || fotoOfertaFinal, // Usa la foto existente si no se sube una nueva
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
  onFileSelectedAndUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      console.error('No se seleccionó ningún archivo.');
      return;
    }

    // Evitar loops de procesamiento
    if (this.archivoProcesado) {
      console.log('Archivo ya procesado, evitando loop.');
      return;
    }

    // Obtiene el archivo seleccionado
    this.archivoSeleccionado = input.files[0];
    const reader = new FileReader();
    console.log('PASO 1: Archivo seleccionado', this.archivoSeleccionado.name);

    reader.onload = () => {
      this.fotoOfertaUrl = reader.result as string;
      console.log('PASO 2: Previsualización cargada', this.fotoOfertaUrl);

      if (this.archivoSeleccionado) {
        // Actualizar el formulario
        this.miFormulario.patchValue({
          fotoOferta: this.archivoSeleccionado.name,
        });

        // Llamar al servicio para subir el archivo
        this.fileUploadService.uploadImage(this.archivoSeleccionado).subscribe({
          next: (response) => {
            console.log('Archivo subido exitosamente:', response);
            this.snackBar.open('Imagen subida correctamente.', 'Cerrar', {
              duration: 3000,
            });

            // Marcar como procesado
            this.archivoProcesado = true;
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            this.snackBar.open('Error al subir la imagen.', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      } else {
        console.error('No se ha seleccionado ningún archivo.');
      }
    };

    reader.readAsDataURL(this.archivoSeleccionado);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    console.log('FI: ' + fileInput);
    fileInput?.click();
  }
  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
