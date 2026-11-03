import {
  Component,
  EventEmitter,
  Output,
  Input,
  Inject,
  OnInit,
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
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'; // Importar FormsModule para usar [(ngModel)]
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../environments/environment';
import { QuillModule } from 'ngx-quill';

export interface ResponseRest<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode: string;
}
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
    MatSelectModule,
    QuillModule,
  ],
  templateUrl: './modal-nueva-empresa.component.html',
  styleUrls: ['./modal-nueva-empresa.component.css'], // Corregido
  providers: [],
})
export class ModalNuevaEmpresaComponent implements OnInit {
  nombreEmpresa: string = '';
  direccionEmpresa: string = '';
  historiaEmpresa: string = '';
  observacionesEmpresa: string = '';
  emailEmpresa: string = '';
  telefonoEmpresa: string = '';
  cuitEmpresa: number = 1;
  idEmpresa: number = 1;
  miFormulario: FormGroup;
  logoSeleccionado: File | null = null;
  @Output() datosActualizadosEmpresa = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() empresa: {
    nombreEmpresa: string;
    cuitEmpresa: number;
    idEmpresa: number;
    idRubro: number;
    emailEmpresa: string;
    telefonoEmpresa: string;
    observacionesEmpresa: string;
    direccionEmpresa: string;
    historiaEmpresa: string;
  } = {
    nombreEmpresa: '',
    cuitEmpresa: 1,
    idEmpresa: 1,
    idRubro: 1,
    emailEmpresa: '',
    telefonoEmpresa: '',
    observacionesEmpresa: '',
    direccionEmpresa: '',
    historiaEmpresa: '',
  };
  rubroSeleccionado: any = null;
  rubros: any[] = [];
  accion: string | undefined;
  mostrarIdHidden: boolean = true;
  imagenPreview: string | null = null;
  isSubmitting = false;
  imagenDesdeBD: string | null = null;
  uploadUrl = environment.local.urlApi;
  limiteCaracteres = 600;
  caracteresHistoria = 0;
  caracteresObservaciones = 0;
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

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; empresa?: any },
  ) {
    this.miFormulario = this.fb.group({
      nombreEmpresa: ['', [Validators.required, Validators.maxLength(100)]],
      direccionEmpresa: ['', [Validators.required, Validators.maxLength(255)]],
      historiaEmpresa: ['', Validators.required],
      observacionesEmpresa: [''],
      emailEmpresa: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(150)],
      ],
      cuitEmpresa: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefonoEmpresa: ['', [Validators.required, Validators.maxLength(20)]],
      idEmpresa: [''],
      idRubro: ['', Validators.required],
    });

    this.accion = data.accion;
    this.empresa = data.empresa || null;
  }

  ngOnInit() {
    this.http.get<any[]>(environment.local.urlApi + '/rubro').subscribe({
      next: (data) => {
        this.rubros = data;
        this.asignarDatosFormulario();
      },
      error: () =>
        this.snackBar.open('Error al cargar rubros', 'Cerrar', {
          duration: 3000,
        }),
    });
    this.miFormulario.get('idRubro')?.valueChanges.subscribe((id) => {
      if (id) {
        this.rubroSeleccionado =
          this.rubros.find((r) => Number(r.idRubro) === Number(id)) || null;
      }
    });
  }

  asignarDatosFormulario() {
    this.miFormulario.reset();
    if (this.data && this.data.empresa) {
      this.imagenDesdeBD = this.data.empresa.logo || null;
      const rubroIdRaw =
        this.data.empresa.idRubro || this.data.empresa.rubro?.idRubro;
      const rubroId = rubroIdRaw ? Number(rubroIdRaw) : '';
      this.miFormulario.patchValue({
        nombreEmpresa:
          this.data.empresa.nombre || this.data.empresa.nombreEmpresa || '',
        cuitEmpresa:
          this.data.empresa.cuit || this.data.empresa.cuitEmpresa || 0,
        emailEmpresa:
          this.data.empresa.email || this.data.empresa.emailEmpresa || '',
        telefonoEmpresa:
          this.data.empresa.telefono || this.data.empresa.telefonoEmpresa || '',
        observacionesEmpresa:
          this.data.empresa.observaciones ||
          this.data.empresa.observacionesEmpresa ||
          '',
        direccionEmpresa:
          this.data.empresa.direccion ||
          this.data.empresa.direccionEmpresa ||
          '',
        historiaEmpresa:
          this.data.empresa.historiaEmpresa || this.data.empresa.historia || '',
        idEmpresa: this.data.empresa.idEmpresa || this.data.empresa.id || 0,
        idRubro: rubroId,
      });
      if (rubroId && this.rubros.length > 0) {
        this.rubroSeleccionado =
          this.rubros.find((r) => Number(r.idRubro) === Number(rubroId)) ||
          null;
      }
    }
  }

  guardar(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();

      this.snackBar.open(
        'Revisá los campos marcados antes de continuar.',
        'Cerrar',
        { duration: 3000 },
      );

      return;
    }

    if (this.accion === 'crear') {
      const cuit = this.miFormulario.get('cuitEmpresa')?.value;

      this.http
        .get<
          ResponseRest<boolean>
        >(`${environment.local.urlApi}/empresas/existe/${cuit}`)
        .subscribe({
          next: (respuesta) => {
            if (respuesta.data) {
              const control = this.miFormulario.get('cuitEmpresa');

              control?.setErrors({
                ...(control.errors || {}),
                cuitDuplicado: true,
              });
              control?.markAsTouched();

              this.snackBar.open(
                'El CUIT ingresado ya existe. Por favor, corrobore.',
                'Cerrar',
                { duration: 3000 },
              );

              return;
            }

            this.crearEmpresa();
          },
          error: () => {
            this.snackBar.open(
              'Error al verificar el CUIT. Inténtelo nuevamente.',
              'Cerrar',
              { duration: 3000 },
            );
          },
        });
    } else {
      this.cargarUpdate(this.miFormulario.value);
    }
  }

  private crearEmpresa(): void {
    const formData = new FormData();
    formData.append('nombre', this.miFormulario.value.nombreEmpresa);
    formData.append('direccion', this.miFormulario.value.direccionEmpresa);
    formData.append('historiaEmpresa', this.miFormulario.value.historiaEmpresa);
    formData.append(
      'observaciones',
      this.miFormulario.value.observacionesEmpresa,
    );
    formData.append('email', this.miFormulario.value.emailEmpresa);
    formData.append('cuit', this.miFormulario.value.cuitEmpresa);
    formData.append('telefono', this.miFormulario.value.telefonoEmpresa);
    formData.append('idRubro', this.miFormulario.value.idRubro);
    if (this.logoSeleccionado) {
      formData.append('logo', this.logoSeleccionado);
    }
    this.http
      .post(`${environment.local.urlApi}/empresas/crear`, formData, {
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          if (response.status === 201) {
            this.snackBar.open('Empresa creada satisfactoriamente', 'Cerrar', {
              duration: 3000,
            });
            this.datosActualizadosEmpresa.emit();
            this.limpiarFormulario();
          }
        },
        error: (err) => {
          const mensaje = err?.error?.message || 'Error al crear la empresa';
          this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        },
      });
  }
  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }

  cargarUpdate(empresa: any) {
    const formData = new FormData();
    formData.append('nombre', empresa.nombreEmpresa);
    formData.append('direccion', empresa.direccionEmpresa);
    formData.append('historiaEmpresa', empresa.historiaEmpresa);
    formData.append('observaciones', empresa.observacionesEmpresa);
    formData.append('email', empresa.emailEmpresa);
    formData.append('telefono', empresa.telefonoEmpresa);
    formData.append('cuit', empresa.cuitEmpresa);
    formData.append('idRubro', this.miFormulario.value.idRubro);
    if (this.logoSeleccionado) {
      formData.append('logo', this.logoSeleccionado);
    }
    this.http
      .put<{
        success: boolean;
        message: string;
        data: any;
        timestamp: string;
        errorCode: string;
      }>(
        `${environment.local.urlApi}/empresas/${empresa.idEmpresa}`,
        formData,
        {
          observe: 'response',
        },
      )
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            const mensaje =
              response.body?.message ||
              'Empresa actualizada satisfactoriamente';

            this.snackBar.open(mensaje, 'Cerrar', {
              duration: 3000,
            });

            this.datosActualizadosEmpresa.emit();
            // this.limpiarFormulario();
          }
        },
        error: (error) => {
          console.error('Error al actualizar la empresa:', error);
          const mensajeError =
            error.error?.message ||
            'Error al actualizar la empresa. Inténtelo nuevamente.';
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 3000,
          });
        },
      });
  }

  limpiarFormulario() {
    this.miFormulario.reset();

    Object.values(this.miFormulario.controls).forEach((control) => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });

    this.logoSeleccionado = null;
    this.imagenPreview = null;
    this.imagenDesdeBD = null;
    this.miFormulario.updateValueAndValidity();
  }

  onLogoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    this.logoSeleccionado = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(this.logoSeleccionado);
    console.log('Logo seleccionado:', this.logoSeleccionado.name);
  }

  mostrarError(campo: string): boolean {
    const control = this.miFormulario.get(campo);

    return !!control && control.invalid && control.touched;
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

  /** * Controla el límite de 600 caracteres. */
  onQuillContentChanged(event: any, campo: string): void {
    const html = event.html || '';
    const cantidad = this.obtenerCantidadCaracteres(html);

    if (campo === 'historiaEmpresa') {
      this.caracteresHistoria = cantidad;
    }

    if (campo === 'observacionesEmpresa') {
      this.caracteresObservaciones = cantidad;
    }

    const control = this.miFormulario.get(campo);
    if (!control) {
      return;
    }

    if (cantidad > this.limiteCaracteres) {
      control.setErrors({ ...(control.errors || {}), maxlength600: true });
    } else {
      if (control.hasError('maxlength600')) {
        const errores = { ...(control.errors || {}) };
        delete errores['maxlength600'];
        control.setErrors(Object.keys(errores).length > 0 ? errores : null);
      }
    }
  }
}
