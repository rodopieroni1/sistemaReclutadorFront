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
  id_empresa: number = 1;
  miFormulario: FormGroup;
  logoSeleccionado: File | null = null;
  @Output() datosActualizadosEmpresa = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() empresa: {
    nombreEmpresa: string;
    cuitEmpresa: number;
    id_empresa: number;
    idRubro: number;
    emailEmpresa: string;
    telefonoEmpresa: string;
    observacionesEmpresa: string;
    direccionEmpresa: string;
    historiaEmpresa: string;
  } = {
    nombreEmpresa: '',
    cuitEmpresa: 1,
    id_empresa: 1,
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

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; empresa?: any },
  ) {
    this.miFormulario = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      direccionEmpresa: ['', Validators.required],
      historiaEmpresa: ['', Validators.required],
      observacionesEmpresa: [''],
      emailEmpresa: ['', [Validators.required, Validators.email]],
      cuitEmpresa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      telefonoEmpresa: ['', Validators.required],
      id_empresa: [''],
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
        id_empresa: this.data.empresa.id_empresa || this.data.empresa.id || 0,
        idRubro: rubroId,
      });
      if (rubroId && this.rubros.length > 0) {
        this.rubroSeleccionado =
          this.rubros.find((r) => Number(r.idRubro) === Number(rubroId)) ||
          null;
      }
    }
  }

  guardar() {
    Object.keys(this.miFormulario.controls).forEach((key) => {
      const control = this.miFormulario.get(key);
    });

    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      return;
    }
    if (this.accion === 'crear') {
      if (
        this.miFormulario.value.nombreEmpresa === '' ||
        this.miFormulario.value.historiaEmpresa === '' ||
        this.miFormulario.value.direccionEmpresa === '' ||
        this.miFormulario.value.emailEmpresa === '' ||
        this.miFormulario.value.cuitEmpresa === ''
      ) {
        this.snackBar.open('Debe completar cada uno de los campos', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
      this.http
        .get<boolean>(
          `${environment.local.urlApi}/empresas/existe/${this.miFormulario.value.cuitEmpresa}`,
        )
        .subscribe({
          next: (existe: boolean) => {
            if (existe) {
              this.snackBar.open(
                'El CUIT ingresado ya existe. Por favor, utiliza otro.',
                'Cerrar',
                { duration: 3000 },
              );
              return;
            }
            const formData = new FormData();
            formData.append('nombre', this.miFormulario.value.nombreEmpresa);
            formData.append(
              'direccion',
              this.miFormulario.value.direccionEmpresa,
            );
            formData.append(
              'historiaEmpresa',
              this.miFormulario.value.historiaEmpresa,
            );
            formData.append(
              'observaciones',
              this.miFormulario.value.observacionesEmpresa,
            );
            formData.append('email', this.miFormulario.value.emailEmpresa);
            formData.append('cuit', this.miFormulario.value.cuitEmpresa);
            formData.append('idRubro', this.miFormulario.value.idRubro);
            if (this.logoSeleccionado) {
              formData.append('logo', this.logoSeleccionado);
            }
            this.http
              .post(environment.local.urlApi + '/empresas/crear', formData, {
                observe: 'response',
              })
              .subscribe({
                next: (response) => {
                  if (response.status === 201 || response.status === 200) {
                    this.snackBar.open(
                      'Empresa creada satisfactoriamente',
                      'Cerrar',
                      { duration: 3000 },
                    );
                    this.datosActualizadosEmpresa.emit();
                    this.limpiarFormulario();
                  }
                },
                error: (err) => {
                  const mensaje =
                    err?.error?.message || 'Error al crear la empresa';
                  this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
                },
              });
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
      this.dialogRef.close();
    }
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
      .put(
        `${environment.local.urlApi}/empresas/actualizar/${empresa.id_empresa}`,
        formData,
        {
          observe: 'response',
        },
      )
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open(
              'Empresa actualizada satisfactoriamente',
              'Cerrar',
              { duration: 3000 },
            );
            this.datosActualizadosEmpresa.emit();
            this.limpiarFormulario();
          }
        },
        error: () => {
          this.snackBar.open(
            'Error al actualizar la empresa. Inténtelo nuevamente.',
            'Cerrar',
            { duration: 3000 },
          );
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
}
