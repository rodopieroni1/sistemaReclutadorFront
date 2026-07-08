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
  uploadUrl = environment.local.urlApi + '/api/uploads/';

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
              descripcionOferta:
                response.descripcionOferta ??
                this.miFormulario.value.descripcionOferta,
              nombreOferta: response.nombreOferta || '',
              idEmpresa: response.empresa?.id_empresa || '',
              estadoOferta: response.estadoOferta,
            });
            console.log(
              '📝 Descripción cargada en el formulario:',
              this.miFormulario.get('descripcionOferta')?.value,
            );

            if (response.fotoOferta) {
              this.archivoSeleccionado = new File(
                [response.fotoOferta],
                response.fotoOferta, // Nombre del archivo
                { type: 'image/jpeg' }, // Ajusta el tipo si es diferente
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
                ? environment.local.urlApi + '/uploads/fotos/' + fotoActual
                : '';
            }
          },
          error: (err) => {
            this.snackBar.open(
              'Error al cargar la oferta para modificar.',
              err,
              {
                duration: 3000,
              },
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
      this.snackBar.open('Debe completar este campos.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    //const datosOferta = this.miFormulario.value;
    const datosOferta = this.miFormulario.getRawValue();
    if (this.accion === 'crear') {
      this.http
        .get<any>(
          `${environment.local.urlApi}/empresas/existeId/${datosOferta.idEmpresa}`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )
        .pipe(
          switchMap((empresa) => {
            const oferta = {
              descripcionOferta: datosOferta.descripcionOferta,
              nombreOferta: datosOferta.nombreOferta,
              estadoOferta: datosOferta.estadoOferta,
              empresa: { id_empresa: empresa.id_empresa },
              fotoOferta: this.archivoSeleccionado?.name,
              idOferta: datosOferta.idOferta || 0,
            };

            if (!oferta.descripcionOferta) {
              this.snackBar.open('Agregue valores a la oferta.', 'Cerrar', {
                duration: 3000,
              });
              return of(null); // corta el flujo
            }

            return this.http.post<HttpResponse<any>>(
              `${environment.local.urlApi}/ofertas/crear`,
              oferta,
              { observe: 'response' },
            );
          }),
          tap((response) => {
            if (
              response &&
              (response.status === 201 || response.status === 200)
            ) {
              this.snackBar.open('Oferta creada satisfactoriamente', 'Cerrar', {
                duration: 3000,
              });
              this.dialogRef.close({ ofertaCreada: true });
            }
          }),
          catchError((error) => {
            this.snackBar.open(
              'Error al crear la oferta o al obtener empresa.',
              'Cerrar',
              { duration: 3000 },
            );
            return of(null);
          }),
        )
        .subscribe();
    } else {
      ////AQUI EMPIEZA EL MODIFICAR
      const idEmpresa = this.miFormulario.value.idEmpresa;
      this.http
        .get<any>(
          `${environment.local.urlApi}/empresas/existeId/${idEmpresa}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
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
            if (!response || !response.id_empresa) {
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
              { duration: 3000 },
            );
          },
        });
    }
  }
  cargarUpdate(oferta: any, response: any) {
    const idOferta =
      this.miFormulario.value.idOferta || this.data.oferta.idOferta;
    const fotoCalculada =
      response?.fotoOferta ||
      this.miFormulario.value.fotoOferta ||
      oferta.fotoOferta;

    const idEmpresaNum = oferta.empresa?.id_empresa || oferta.idEmpresa;

    if (!idEmpresaNum) {
      this.snackBar.open('Error: El ID de la empresa está vacío.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // 2. Construimos el payload limpio para enviar al backend
    const ofertaPayload = {
      descripcionOferta: oferta.descripcionOferta,
      estadoOferta: oferta.estadoOferta,
      fotoOferta: fotoCalculada, // <-- Ahora sí guardará la imagen correcta
      nombreOferta: oferta.nombreOferta,
      empresa: {
        id_empresa: idEmpresaNum,
      },
      idOferta: idOferta,
    };

    this.http
      .put(
        `${environment.local.urlApi}/ofertas/actualizar/${idOferta}`,
        ofertaPayload, // <-- Enviamos el payload corregido
        {
          headers: { 'Content-Type': 'application/json' },
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
      return `${environment.local.urlApi}/uploads/fotos/${this.imagenDesdeBD}`;
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
