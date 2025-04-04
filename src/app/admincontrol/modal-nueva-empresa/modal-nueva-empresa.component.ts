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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

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
    emailEmpresa: string;
    observacionesEmpresa: string;
    direccionEmpresa: string;
    historiaEmpresa: string;
  } = {
    nombreEmpresa: '',
    cuitEmpresa: 1,
    id_empresa: 1,
    emailEmpresa: '',
    observacionesEmpresa: '',
    direccionEmpresa: '',
    historiaEmpresa: '',
  };

  accion: string | undefined;
  mostrarIdHidden: boolean = true; // Inicialmente oculto
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; empresa?: any }
  ) {
    this.miFormulario = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      direccionEmpresa: ['', Validators.required],
      historiaEmpresa: ['', Validators.required],
      observacionesEmpresa: [''],
      emailEmpresa: ['', [Validators.required, Validators.email]],
      cuitEmpresa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      id_empresa: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
    this.accion = data.accion; // Recibe la acción (crear o actualizar)
    this.empresa = data.empresa || null; // Recibe la empresa si es actualización
  }

  ngOnInit() {
    // Mostrar u ocultar el campo ID según la acción (crear o actualizar)
    this.mostrarIdHidden = this.empresa?.id_empresa ? false : true;
    if (this.empresa && Object.keys(this.empresa).length > 0) {
      // Asignar los valores de la empresa al formulario
      this.miFormulario.patchValue({
        nombreEmpresa: this.data.empresa?.nombre || '',
        cuitEmpresa: this.data.empresa?.cuit || 0,
        emailEmpresa: this.data.empresa?.email || '',
        observacionesEmpresa: this.data.empresa?.observaciones || '',
        direccionEmpresa: this.data.empresa?.direccion || '',
        historiaEmpresa: this.data.empresa?.historiaEmpresa || '',
        id_empresa: this.data.empresa?.id_empresa || 0,
      });
    }
  }

  guardar() {
    // Validar que el formulario sea válido
    if (this.miFormulario.value.invalid) {
      this.snackBar.open(
        'Por favor, completa todos los campos antes de guardar.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    // Si el formulario es válido, continuar con la lógica de guardar
    if (this.accion === 'crear') {
      if (this.miFormulario.value.cuitEmpresa === 1) {
        this.snackBar.open('El CUIT debe ser distinto a 1.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      // Validar que el CUIT no exista en la base de datos
      this.http
        .get<boolean>(
          `http://localhost:8080/empresas/existe/${this.miFormulario.value.cuitEmpresa}`
        )
        .subscribe({
          next: (existe: boolean) => {
            if (existe) {
              this.snackBar.open(
                'El CUIT ingresado ya existe. Por favor, utiliza otro.',
                'Cerrar',
                { duration: 3000 }
              );
              return;
            }

            // Si el CUIT no existe, crea la empresa
            const empresa = this.miFormulario.value;
            this.http
              .post('http://localhost:8080/empresas/crear', empresa, {
                headers: { 'Content-Type': 'application/json' },
                observe: 'response',
              })
              .subscribe({
                next: (response) => {
                  if (response.status === 201 || response.status === 200) {
                    this.snackBar.open(
                      'Empresa creada satisfactoriamente',
                      'Cerrar',
                      { duration: 3000 }
                    );
                    this.datosActualizadosEmpresa.emit();
                    this.miFormulario.reset();
                  }
                },
                error: () => {
                  this.snackBar.open(
                    'Error al crear la empresa. Inténtelo nuevamente.',
                    'Cerrar',
                    { duration: 3000 }
                  );
                },
              });
          },
          error: () => {
            this.snackBar.open(
              'Error al verificar el CUIT. Inténtelo nuevamente.',
              'Cerrar',
              { duration: 3000 }
            );
          },
        });
    } else {
      this.cargarUpdate(this.miFormulario.value);
      this.dialogRef.close(); // Cierra el modal sin acción
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
        }
      )
      .subscribe({
        next: (response) => {
          if (response.status === 201 || response.status === 200) {
            this.snackBar.open(
              'Empresa actualizada satisfactoriamente',
              'Cerrar',
              { duration: 3000 }
            );
            this.datosActualizadosEmpresa.emit();
            this.miFormulario.reset();
          }
        },
        error: () => {
          this.snackBar.open(
            'Error al actualizar la empresa. Inténtelo nuevamente.',
            'Cerrar',
            { duration: 3000 }
          );
        },
      });
  }
}
