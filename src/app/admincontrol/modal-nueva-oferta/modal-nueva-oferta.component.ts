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
import { HttpClient, HttpResponse } from '@angular/common/http';
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
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../environments/environment';

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
    MatDividerModule,
  ],
  templateUrl: './modal-nueva-oferta.component.html',
  styleUrl: './modal-nueva-oferta.component.css',
})
export class ModalNuevaOfertaComponent implements OnInit {
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
  uploadUrl = environment.local.urlApi;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any },
  ) {
    this.miFormulario = this.fb.group({
      descripcionOferta: ['', Validators.required],
      nombreOferta: ['', Validators.required],
      fotoOferta: ['', Validators.required],
      idEmpresa: ['', Validators.required], // Este debe coincidir con formControlName en HTML
      idOferta: ['', Validators.required],
      estadoOferta: [false, Validators.required],
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
  }

  ngOnInit(): void {
    this.obtenerEmpresas();

    if (this.data.oferta) {
      this.http
        .get<any>(
          `${environment.local.urlApi}/ofertas/existeId/${this.data.oferta.idOferta}`,
        )
        .subscribe({
          next: (response) => {
            this.miFormulario.patchValue({
              descripcionOferta: response.descripcionOferta || '',
              nombreOferta: response.nombreOferta || '',
              idEmpresa: response.empresa?.id_empresa || '',
              estadoOferta: response.estadoOferta,
              fotoOferta: response.fotoOferta || '',
            });

            // Nombre de la imagen guardado en la BD
            this.imagenDesdeBD = response.fotoOferta;

            // Mostrar la imagen
            if (this.imagenDesdeBD) {
              this.imagenPreview = `${environment.local.urlApi}/uploads/ofertas/${this.imagenDesdeBD}`;
            }

            // Muy importante: NO crear un File con el nombre
            this.archivoSeleccionado = null;

            console.log('Imagen desde BD:', this.imagenDesdeBD);
          },
          error: (err) => {
            this.snackBar.open(
              'Error al cargar la oferta para modificar.',
              'Cerrar',
              { duration: 3000 },
            );
          },
        });
    }
  }
  obtenerEmpresas(): void {
    this.http.get<any[]>(environment.local.urlApi + '/empresas').subscribe({
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
      this.snackBar.open('Debe completar estos campos.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const datosOferta = this.miFormulario.getRawValue();

    // 1. Validar la existencia de la Empresa
    this.http
      .get<any>(
        `${environment.local.urlApi}/empresas/existeId/${datosOferta.idEmpresa}`,
      )
      .pipe(
        switchMap((empresa) => {
          if (!datosOferta.descripcionOferta) {
            this.snackBar.open('Agregue valores a la oferta.', 'Cerrar', {
              duration: 3000,
            });
            return of(null);
          }

          // 2. Armar el FormData con los campos del backend
          const formData = new FormData();
          formData.append('nombreOferta', datosOferta.nombreOferta);
          formData.append('descripcionOferta', datosOferta.descripcionOferta);
          formData.append('estadoOferta', String(datosOferta.estadoOferta));
          formData.append('idEmpresa', String(empresa.id_empresa));

          // Enviar el nombre como String si existe
          if (this.archivoSeleccionado?.name) {
            formData.append('fotoOferta', this.archivoSeleccionado.name);
          }

          // Enviar el archivo físico binario
          if (this.archivoSeleccionado) {
            formData.append('fotoArchivo', this.archivoSeleccionado);
          }

          // 3. Ejecutar POST para crear o PUT para actualizar según la acción
          if (this.accion === 'crear') {
            return this.http.post<HttpResponse<any>>(
              `${environment.local.urlApi}/ofertas/crear`,
              formData,
              { observe: 'response' },
            );
          } else {
            const idOferta = datosOferta.idOferta || this.oferta?.idOferta;
            return this.http.put<HttpResponse<any>>(
              `${environment.local.urlApi}/ofertas/actualizar/${idOferta}`,
              formData,
              { observe: 'response' },
            );
          }
        }),
        tap((response) => {
          if (
            response &&
            (response.status === 201 || response.status === 200)
          ) {
            const mensaje =
              this.accion === 'crear'
                ? 'Oferta creada satisfactoriamente'
                : 'Oferta actualizada satisfactoriamente';

            this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
            this.dialogRef.close({ ofertaCreada: true });
          }
        }),
        catchError((error) => {
          this.snackBar.open(
            'Error al procesar la oferta o al obtener empresa.',
            'Cerrar',
            { duration: 3000 },
          );
          return of(null);
        }),
      )
      .subscribe();
  }
  cargarUpdate(oferta: any, response: any) {
    const idOferta =
      this.miFormulario.value.idOferta || this.data.oferta.idOferta;
    const fotoCalculada =
      this.miFormulario.value.fotoOferta || this.imagenDesdeBD;
    const idEmpresaNum = oferta.empresa?.id_empresa || oferta.idEmpresa;
    if (!idEmpresaNum) {
      this.snackBar.open('Error: El ID de la empresa está vacío.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const ofertaPayload = new FormData();
    ofertaPayload.append('descripcionOferta', oferta.descripcionOferta);
    ofertaPayload.append('estadoOferta', String(oferta.estadoOferta));
    ofertaPayload.append('fotoOferta', fotoCalculada || '');
    ofertaPayload.append('nombreOferta', oferta.nombreOferta);
    ofertaPayload.append('idEmpresa', idEmpresaNum.toString());
    ofertaPayload.append('idOferta', idOferta.toString());

    if (this.archivoSeleccionado && this.archivoSeleccionado.size > 0) {
      ofertaPayload.append(
        'fotoArchivo',
        this.archivoSeleccionado,
        this.archivoSeleccionado.name,
      );
    }

    this.http
      .put(
        `${environment.local.urlApi}/ofertas/actualizar/${idOferta}`,
        ofertaPayload,
        {
          observe: 'response',
        },
      )
      .subscribe({
        next: (res) => {
          if (res.status === 201 || res.status === 200) {
            console.log('Oferta actualizada con éxito:', res.body);

            this.snackBar.open(
              'Oferta actualizada satisfactoriamente',
              'Cerrar',
              { duration: 3000 },
            );
            this.datosActualizadosOferta.emit();
            this.dialogRef.close();
          }
        },
        error: (err) => {
          console.error('Error al actualizar en el servidor:', err);
          this.snackBar.open(
            'Error al actualizar la Oferta. Inténtelo nuevamente.',
            'Cerrar',
            { duration: 3000 },
          );
        },
      });
  }

  getImagenUrl(): string {
    if (this.imagenPreview) {
      return this.imagenPreview;
    } else if (this.imagenDesdeBD) {
      return `${environment.local.urlApi}/uploads/ofertas/${this.imagenDesdeBD}`;
    }
    return '';
  }

  onArchivoSeleccionado(event: Event): void {
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
    console.log('📸 Imagen seleccionada:', this.archivoSeleccionado.name);
  }

  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }
}
