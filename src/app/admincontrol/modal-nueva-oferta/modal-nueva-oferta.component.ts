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
    // Solución 1: Eliminar Validators.required de idOferta y fotoOferta
    this.miFormulario = this.fb.group({
      idOferta: [null],
      nombreOferta: ['', Validators.required],
      descripcionOferta: ['', Validators.required],
      estadoOferta: [true, Validators.required],
      idEmpresa: [null, Validators.required],
      fotoOferta: [''],
    });
    this.accion = data.accion;
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
            console.log('📌 Respuesta de oferta:', response);

            // Solución 2: Extraer el ID de empresa garantizando un fallback numérico
            const idEmpresaCalculado =
              response.empresa?.id_empresa ??
              response.empresa?.id ??
              response.idEmpresa ??
              this.data.oferta?.empresa?.id_empresa ??
              this.data.oferta?.empresa?.id ??
              1;

            this.miFormulario.patchValue({
              idOferta: response.idOferta || this.data.oferta.idOferta,
              descripcionOferta: response.descripcionOferta || '',
              nombreOferta: response.nombreOferta || '',
              idEmpresa: idEmpresaCalculado, // Asigna un ID numérico válido siempre
              estadoOferta: response.estadoOferta,
              fotoOferta: response.fotoOferta || '',
            });

            this.imagenDesdeBD = response.fotoOferta;
            this.archivoSeleccionado = null;

            if (this.imagenDesdeBD) {
              this.imagenPreview = `${environment.local.urlApi}/uploads/ofertas/${this.imagenDesdeBD}`;
            }
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
    this.http.get<any>(environment.local.urlApi + '/empresas').subscribe({
      next: (data: any) => {
        // Extrae la lista en caso de que venga en data, content o sea una lista directa
        this.empresas = Array.isArray(data)
          ? data
          : data.content || data.data || [];
      },
      error: (err) => {
        this.snackBar.open('Error al cargar las empresas.', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  guardar(): void {
    // 1. Validar el formulario con Angular Reactive Forms
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      this.snackBar.open(
        'Debe completar todos los campos obligatorios.',
        'Cerrar',
        {
          duration: 3000,
        },
      );
      return;
    }

    const datosOferta = this.miFormulario.getRawValue();

    // 2. Determinar el ID de la empresa de forma segura
    const idEmpresaLimpio = Number(datosOferta.idEmpresa) || 1;

    // 3. Armar el FormData directamente
    const formData = new FormData();
    formData.append('nombreOferta', datosOferta.nombreOferta);
    formData.append('descripcionOferta', datosOferta.descripcionOferta);
    formData.append('estadoOferta', String(datosOferta.estadoOferta));
    formData.append('idEmpresa', String(idEmpresaLimpio));

    // Manejar el envío de la foto
    if (this.archivoSeleccionado) {
      formData.append('fotoOferta', this.archivoSeleccionado.name);
      formData.append('fotoArchivo', this.archivoSeleccionado);
    } else if (this.imagenDesdeBD) {
      formData.append('fotoOferta', this.imagenDesdeBD);
    }

    // 4. Determinar si se crea o se actualiza
    const idOferta = datosOferta.idOferta || this.data?.oferta?.idOferta;
    const esCrear = this.accion === 'crear';

    const request$ = esCrear
      ? this.http.post<HttpResponse<any>>(
          `${environment.local.urlApi}/ofertas/crear`,
          formData,
          { observe: 'response' },
        )
      : this.http.put<HttpResponse<any>>(
          `${environment.local.urlApi}/ofertas/actualizar/${idOferta}`,
          formData,
          { observe: 'response' },
        );

    // 5. Ejecutar la petición
    request$
      .pipe(
        tap((response) => {
          if (
            response &&
            (response.status === 201 || response.status === 200)
          ) {
            const mensaje = esCrear
              ? 'Oferta creada satisfactoriamente'
              : 'Oferta actualizada satisfactoriamente';

            this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
            this.dialogRef.close({ ofertaCreada: true });
          }
        }),
        catchError((error) => {
          console.error('Error detallado:', error);
          this.snackBar.open(
            'Error al procesar la oferta. Verifique la consola.',
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
