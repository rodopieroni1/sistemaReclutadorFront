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
  cuitEmpresa: number = 1;
  id_empresa: number = 1;
  miFormulario: FormGroup;
  @Output() datosActualizadosEmpresa = new EventEmitter<void>(); // Evento para notificar cambios
  @Input() empresa: {
    nombreEmpresa: string;
    cuitEmpresa: number;
    id_empresa: number;
    idRubro: number;
    emailEmpresa: string;
    observacionesEmpresa: string;
    direccionEmpresa: string;
    historiaEmpresa: string;
  } = {
    nombreEmpresa: '',
    cuitEmpresa: 1,
    id_empresa: 1,
    idRubro: 1,
    emailEmpresa: '',
    observacionesEmpresa: '',
    direccionEmpresa: '',
    historiaEmpresa: '',
  };
  rubroSeleccionado: any = null;
  rubros: any[] = []; // Lista de rubros
  // Agregar propiedad para la acción (crear o actualizar)
  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    private route: ActivatedRoute,

    @Inject(MAT_DIALOG_DATA) public data: { accion: string; empresa?: any },
  ) {
    this.miFormulario = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      direccionEmpresa: ['', Validators.required],
      historiaEmpresa: ['', Validators.required],
      observacionesEmpresa: [''],
      emailEmpresa: ['', [Validators.required, Validators.email]],
      cuitEmpresa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      id_empresa: [''],
      idRubro: ['', Validators.required], // ← nuevo campo agregado
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
    this.empresa = data.empresa || null; // Recibe la empresa si es actualización
  }

  ngOnInit() {
    if (this.empresa && Object.keys(this.empresa).length > 0) {
      this.miFormulario.patchValue({
        nombreEmpresa: this.data.empresa?.nombre || '',
        cuitEmpresa: this.data.empresa?.cuit || 0,
        emailEmpresa: this.data.empresa?.email || '',
        observacionesEmpresa: this.data.empresa?.observaciones || '',
        direccionEmpresa: this.data.empresa?.direccion || '',
        historiaEmpresa: this.data.empresa?.historiaEmpresa || '',
        id_empresa: this.data.empresa?.id_empresa || 0,
        idRubro: this.data.empresa?.idRubro || '', // ← nuevo campo agregado
      });
    }

    // Cargar rubros normalmente
    this.http.get<any[]>(environment.local.urlApi + 'rubro').subscribe({
      next: (data) => (this.rubros = data),
      error: () =>
        this.snackBar.open('Error al cargar rubros', 'Cerrar', {
          duration: 3000,
        }),
    });

    // Reaccionar al cambio de rubro
    this.miFormulario.get('idRubro')?.valueChanges.subscribe((id: number) => {
      this.rubroSeleccionado =
        this.rubros.find((r) => r.idRubro === id) || null;
    });
  }

  guardar() {
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
            console.log('this.miFormulario.value:  ', this.miFormulario.value);
            const empresa = this.miFormulario.value;
            this.http
              .post(environment.local.urlApi + 'empresas/crear', empresa, {
                headers: { 'Content-Type': 'application/json' },
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
      console.log('this.miFormulario.value', this.miFormulario.value);
      this.cargarUpdate(this.miFormulario.value);
      this.dialogRef.close();
    }
  }

  cerrar() {
    this.dialogRef.close(); // Cierra el modal sin acción
  }

  cargarUpdate(empresa: any) {
    // Usar patchValue para asignar los datos al formulario
    this.miFormulario.patchValue({
      nombreEmpresa: empresa.nombreEmpresa,
      cuitEmpresa: empresa.cuitEmpresa,
      emailEmpresa: empresa.emailEmpresa,
      observacionesEmpresa: empresa.observacionesEmpresa,
      direccionEmpresa: empresa.direccionEmpresa,
      historiaEmpresa: empresa.historiaEmpresa,
      id_empresa: empresa.id_empresa,
    });
    this.http
      .put(
        `http://localhost:8080/empresas/actualizar/${empresa.id_empresa}`,
        empresa,
        {
          headers: { 'Content-Type': 'application/json' },
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

    this.miFormulario.updateValueAndValidity();
  }
}
