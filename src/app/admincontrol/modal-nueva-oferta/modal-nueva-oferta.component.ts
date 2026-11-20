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
import { QuillModule } from 'ngx-quill';
import { UbicacionService } from '../../ubicacion.service';
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
    QuillModule,
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
  miFormularioSubmitted = false;
  @Output() datosActualizadosOferta = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() oferta: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    estadoOferta: boolean;
    empresa: { idEmpresa: number };
  } = {
    idOferta: 1,
    nombreOferta: '',
    descripcionOferta: '',
    fotoOferta: '',
    estadoOferta: false,
    empresa: { idEmpresa: 0 },
  };
  fotoOfertaUrl: string = '';
  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  archivoSeleccionado: File | null = null; // Archivo subido
  imagenPreview: string | null = null;
  isSubmitting = false;
  uploadUrl = environment.local.urlApi;
  limiteCaracteresDescripcion = 600;
  caracteresDescripcion = 0;
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };
  paises: any[] = [];
  provincias: any[] = [];
  localidades: string[] = [];

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalNuevaOfertaComponent>,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; oferta?: any },
  ) {
    this.miFormulario = this.fb.group({
      idOferta: [null],
      nombreOferta: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      modalidad: ['PRESENCIAL', Validators.required],
      direccionTrabajo: [''],
      paisTrabajo: [''],
      provinciaTrabajo: [''],
      localidadTrabajo: [''],
      descripcionOferta: ['', Validators.required],
      estadoOferta: [true, Validators.required],
      idEmpresa: [null, Validators.required],
      fotoOferta: [''],
    });

    this.accion = data.accion;
  }

  ngOnInit(): void {
    this.obtenerEmpresas();
    this.cargarPaises();
    if (this.data.oferta) {
      this.http
        .get<any>(
          `${environment.local.urlApi}/ofertas/existeId/${this.data.oferta.idOferta}`,
        )
        .subscribe({
          next: (response) => {
            console.log('OFERTA RECUPERADA DEL BACKEND:', response);

            const idEmpresaCalculado =
              response.empresa?.idEmpresa ??
              response.empresa?.id ??
              response.idEmpresa ??
              this.data.oferta?.empresa?.idEmpresa ??
              1;

            // Primero cargamos los datos generales y el país
            this.miFormulario.patchValue({
              idOferta: response.idOferta || this.data.oferta.idOferta,
              nombreOferta: response.nombreOferta || '',
              descripcionOferta: response.descripcionOferta || '',
              modalidad: response.modalidad || 'PRESENCIAL',
              direccionTrabajo: response.direccionTrabajo || '',
              paisTrabajo: response.paisTrabajo || '',
              estadoOferta: response.estadoOferta,
              idEmpresa: idEmpresaCalculado,
              fotoOferta: response.fotoOferta || '',
            });

            this.imagenDesdeBD = response.fotoOferta;
            this.archivoSeleccionado = null;

            if (this.imagenDesdeBD) {
              this.imagenPreview = `${environment.local.urlApi}/uploads/ofertas/${this.imagenDesdeBD}`;
            }

            // Recuperamos provincias del país guardado
            const pais = response.paisTrabajo;
            const provincia = response.provinciaTrabajo;
            const localidad = response.localidadTrabajo;

            if (pais) {
              this.ubicacionService.getProvincias(pais).subscribe({
                next: (respuesta) => {
                  this.provincias = respuesta.data?.states || [];

                  // Seleccionamos la provincia después de cargar sus opciones
                  this.miFormulario.patchValue({
                    provinciaTrabajo: provincia || '',
                  });

                  if (pais && provincia) {
                    this.ubicacionService
                      .getLocalidades(pais, provincia)
                      .subscribe({
                        next: (respuestaLocalidades) => {
                          this.localidades = respuestaLocalidades.data || [];
                          // Seleccionamos la localidad después de cargar sus opciones
                          this.miFormulario.patchValue({
                            localidadTrabajo: localidad || '',
                          });
                          console.log('UBICACIÓN RECUPERADA:', {
                            pais,
                            provincia,
                            localidad,
                            provincias: this.provincias,
                            localidades: this.localidades,
                          });
                        },
                        error: (err) => {
                          console.error('Error recuperando localidades:', err);
                        },
                      });
                  }
                },
                error: (err) => {
                  console.error('Error recuperando provincias:', err);
                },
              });
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
        console.log('Respuesta de /empresas:', data);

        this.empresas = Array.isArray(data)
          ? data
          : data.content || data.data || [];
        console.log('Empresas cargadas:', this.empresas);
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);

        this.snackBar.open('Error al cargar las empresas.', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
  cargarPaises(): void {
    this.ubicacionService.getPaises().subscribe({
      next: (respuesta) => {
        this.paises = respuesta.data || [];
      },
      error: (error) => console.error('Error al cargar países:', error),
    });
  }

  alCambiarPais(): void {
    const pais = this.miFormulario.get('paisTrabajo')?.value;

    this.provincias = [];
    this.localidades = [];

    this.miFormulario.patchValue({
      provinciaTrabajo: '',
      localidadTrabajo: '',
    });

    if (!pais) return;

    this.ubicacionService.getProvincias(pais).subscribe({
      next: (respuesta) => {
        this.provincias = respuesta.data?.states || [];
      },
      error: (error) => console.error('Error al cargar provincias:', error),
    });
  }

  alCambiarProvincia(): void {
    const pais = this.miFormulario.get('paisTrabajo')?.value;
    const provincia = this.miFormulario.get('provinciaTrabajo')?.value;

    this.localidades = [];

    this.miFormulario.patchValue({
      localidadTrabajo: '',
    });

    if (!pais || !provincia) return;

    this.ubicacionService.getLocalidades(pais, provincia).subscribe({
      next: (respuesta) => {
        this.localidades = respuesta.data || [];
      },
      error: (error) => console.error('Error al cargar localidades:', error),
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
    // Datos de geolocalización
    formData.append('modalidad', datosOferta.modalidad);
    formData.append('direccionTrabajo', datosOferta.direccionTrabajo || '');
    formData.append('paisTrabajo', datosOferta.paisTrabajo || '');
    formData.append('provinciaTrabajo', datosOferta.provinciaTrabajo || '');
    formData.append('localidadTrabajo', datosOferta.localidadTrabajo || '');
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

    if (esCrear) {
      this.http
        .post(`${environment.local.urlApi}/ofertas/crear`, formData, {
          observe: 'response',
        })
        .subscribe({
          next: (response) => {
            if (response.status === 200 || response.status === 201) {
              this.snackBar.open('Oferta creada satisfactoriamente', 'Cerrar', {
                duration: 3000,
              });

              this.datosActualizadosOferta.emit();
              this.dialogRef.close({ ofertaCreada: true });
            }
          },
          error: (err) => {
            console.error('Error al crear oferta:', err);
          },
        });
    } else {
      console.log('ENTRANDO A cargarUpdate DESDE guardar()');

      this.cargarUpdate(datosOferta, null);
    }
  }

  cargarUpdate(oferta: any, response: any) {
    console.log('===== OFERTA RECIBIDA EN cargarUpdate =====');
    console.log('Oferta completa:', oferta);
    console.log('Dirección:', oferta.direccionTrabajo);
    console.log('País:', oferta.paisTrabajo);
    console.log('Provincia:', oferta.provinciaTrabajo);
    console.log('Localidad:', oferta.localidadTrabajo);
    console.log('Modalidad:', oferta.modalidad);
    console.log('==========================================');

    const idOferta =
      this.miFormulario.value.idOferta || this.data.oferta.idOferta;

    const fotoCalculada =
      this.miFormulario.value.fotoOferta || this.imagenDesdeBD;

    const idEmpresaNum = oferta.empresa?.idEmpresa || oferta.idEmpresa;

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

    ofertaPayload.append('modalidad', oferta.modalidad || 'PRESENCIAL');
    ofertaPayload.append('direccionTrabajo', oferta.direccionTrabajo || '');
    ofertaPayload.append('paisTrabajo', oferta.paisTrabajo || '');
    ofertaPayload.append('provinciaTrabajo', oferta.provinciaTrabajo || '');
    ofertaPayload.append('localidadTrabajo', oferta.localidadTrabajo || '');

    ofertaPayload.append('idEmpresa', idEmpresaNum.toString());
    ofertaPayload.append('idOferta', idOferta.toString());

    if (this.archivoSeleccionado && this.archivoSeleccionado.size > 0) {
      ofertaPayload.append(
        'fotoArchivo',
        this.archivoSeleccionado,
        this.archivoSeleccionado.name,
      );
    }

    console.log('===== DATOS QUE SE ENVÍAN AL BACKEND =====');

    ofertaPayload.forEach((valor, clave) => {
      console.log(clave, valor);
    });

    console.log('==========================================');

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

  mostrarError(campo: string): boolean {
    const control = this.miFormulario.get(campo);

    return (
      !!control &&
      control.invalid &&
      (control.touched || this.miFormularioSubmitted)
    );
  }

  obtenerCantidadCaracteres(html: string): number {
    if (!html) {
      return 0;
    }

    const div = document.createElement('div');
    div.innerHTML = html;

    const texto = div.textContent || div.innerText || '';

    return texto.replace(/\u200B/g, '').length;
  }

  onDescripcionContentChanged(event: any): void {
    const html = event.html || '';
    const cantidad = this.obtenerCantidadCaracteres(html);

    this.caracteresDescripcion = cantidad;

    const control = this.miFormulario.get('descripcionOferta');

    if (!control) {
      return;
    }

    if (cantidad > this.limiteCaracteresDescripcion) {
      control.setErrors({
        ...(control.errors || {}),
        maxlength600: true,
      });
    } else if (control.hasError('maxlength600')) {
      const errores = { ...(control.errors || {}) };

      delete errores['maxlength600'];

      control.setErrors(Object.keys(errores).length > 0 ? errores : null);
    }
  }

  obtenerIdUsuarioDelToken(): number | null {
    const token = sessionStorage.getItem('usuarioToken');
    console.log('🔑 Token JWT obtenido del sessionStorage:', token);
    if (!token) {
      return null;
    }

    try {
      const payloadBase64 = token
        .split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(atob(payloadBase64));

      // Ajustar el nombre según el claim real del JWT.
      return payload.idUsuario ?? payload.id_usuario ?? payload.id ?? null;
    } catch (error) {
      console.error('No se pudo leer el JWT:', error);
      return null;
    }
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
