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
import { FileUploadService } from '../modal-nueva-oferta/file-upload-service.service';

@Component({
  selector: 'app-modal-nueva-oferta',
  standalone: true,
  imports: [
    CommonModule,
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
  nombreOferta: string = '';
  fotoOferta: string = '';
  idEmpresa: number = 1;
  miFormulario: FormGroup;
  empresas: any[] = [];
  imagenDesdeBD: string | null = null;
  @Output() datosActualizadosOferta = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() oferta: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    estadoOferta: boolean;
    empresa: { id_empresa: number };
  } = {
    idOferta: 1,
    nombreOferta: '',
    descripcionOferta: '',
    fotoOferta: '',
    estadoOferta: false,
    empresa: { id_empresa: 0 },
  };
  fotoOfertaUrl: string = '';
  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  archivoSeleccionado: File | null = null; // Archivo subido
  imagenPreview: string | null = null;
  isSubmitting = false;
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any }
  ) {
    this.miFormulario = this.fb.group({
      descripcionOferta: ['', Validators.required],
      nombreOferta: ['', Validators.required],
      fotoOferta: ['', Validators.required],
      idEmpresa: ['', Validators.required], // Este debe coincidir con formControlName en HTML
      idOferta: ['', Validators.required],
      estadoOferta: ['', Validators.required],
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
  }

  ngOnInit(): void {
    this.obtenerEmpresas();
    if (this.data.oferta) {
      this.http
        .get<any>(
          `http://localhost:8080/ofertas/existeId/${this.data.oferta.idOferta}`
        )
        .subscribe({
          next: (response) => {
            this.miFormulario.patchValue({
              descripcionOferta: response.descripcionOferta || '',
              nombreOferta: response.nombreOferta || '',
              idEmpresa: response.empresa?.id_empresa || '',
              estadoOferta: response.estadoOferta,
            });
            if (response.fotoOferta) {
              this.archivoSeleccionado = new File(
                [response.fotoOferta],
                response.fotoOferta, // Nombre del archivo
                { type: 'image/jpeg' } // Ajusta el tipo si es diferente
              );
            }
            this.imagenDesdeBD = response.fotoOferta;
            console.log('this.imagenDesdeBD ', this.imagenDesdeBD);
            this.miFormulario.patchValue({
              fotoOferta: response.fotoOferta,
            });
            const fotoActual = this.miFormulario.get('fotoOferta')?.value;
            if (fotoActual) {
              this.imagenPreview = fotoActual
                ? 'assets/uploads/fotos/' + fotoActual
                : '';
            }
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
  }
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
    if (
      this.miFormulario.value.nombreOferta === '' ||
      this.miFormulario.value.idEmpresa === '' ||
      this.miFormulario.value.estadoOferta === ''
    ) {
      this.snackBar.open('Debe completar este campos.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (this.accion === 'crear') {
      // Realiza el GET para obtener la información de la empresa
      this.http
        .get<any>(
          `http://localhost:8080/empresas/existeId/${this.miFormulario.value.idEmpresa}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .subscribe({
          next: (empresa) => {
            const oferta = {
              descripcionOferta: this.miFormulario.value.descripcionOferta,
              nombreOferta: this.miFormulario.value.nombreOferta,
              estadoOferta: this.miFormulario.value.estadoOferta,
              empresa: {
                id_empresa: empresa.id_empresa, // Usar el valor del backend
              }, // Agregar el objeto completo de empresa
              fotoOferta: this.archivoSeleccionado?.name,
              idOferta: this.miFormulario.value.idOferta || 0,
            };
            if (oferta.descripcionOferta === '') {
              this.snackBar.open('Agrege valores a la oferta.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }
            if (oferta.nombreOferta === '') {
              this.snackBar.open('Agrege valores a la oferta.', 'Cerrar', {
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
                    //this.datosActualizadosOferta.emit();
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
              nombreOferta: this.miFormulario.value.nombreOferta,
              estadoOferta: this.miFormulario.value.estadoOferta,
              empresa: {
                id_empresa: this.miFormulario.value.idEmpresa,
              },
              fotoOferta: this.archivoSeleccionado?.name,
            };
            if (this.miFormulario.value.descripcionOferta === '') {
              this.snackBar.open('Agrege valores a la oferta 1.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }
            if (response.empresa === '') {
              this.snackBar.open('Agrege valores a la oferta 2.', 'Cerrar', {
                duration: 3000,
              });
              return;
            }

            this.cargarUpdate(oferta, response);
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
    const idEmpresa = oferta.empresa.id_empresa;
    if (!idEmpresa) {
      this.snackBar.open('Error: idEmpresa está vacío.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    oferta = {
      descripcionOferta: oferta.descripcionOferta,
      estadoOferta: oferta.estadoOferta,
      fotoOferta: oferta.fotoOferta || fotoOfertaFinal, // Usa la foto existente si no se sube una nueva
      empresa: {
        id_empresa: idEmpresa, // Usar el valor del backend
      },
      idOferta: idOferta,
      nombreOferta: oferta.nombreOferta,
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
              'Oferta actualizada satisfactoriamente',
              'Cerrar',
              { duration: 3000 }
            );
            this.datosActualizadosOferta.emit();
            this.dialogRef.close();
          }
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
  onFileSelectedAndUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.archivoSeleccionado = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(this.archivoSeleccionado);
    const formData = new FormData();
    formData.append('imagen', this.archivoSeleccionado);
    const upload$ = this.fileUploadService.uploadImage(
      this.archivoSeleccionado
    );
    upload$.subscribe({
      next: (response) => {
        if (response.status === 201 || response.status === 200) {
          this.snackBar.open('Imagen subida correctamente....', 'Cerrar', {
            duration: 3000,
          });
        }
      },
      error: (error) => {
        this.snackBar.open('Error al subir la imagen.', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
