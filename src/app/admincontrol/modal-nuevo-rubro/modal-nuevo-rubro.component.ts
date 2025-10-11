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
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-nuevo-rubro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormField,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './modal-nuevo-rubro.component.html',
  styleUrls: ['./modal-nuevo-rubro.component.css'],
})
export class ModalNuevoRubroComponent implements OnInit {
  @Output() datosActualizadosRubro = new EventEmitter<void>();
  @Input() rubro: { idRubro?: number; descripcionRubro: string } = {
    descripcionRubro: '',
  };

  accion: string | undefined;
  miFormulario!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ModalNuevoRubroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accion: string; rubro?: any }
  ) {
    this.accion = data.accion as 'crear' | 'actualizar';
    this.rubro = data.rubro || { descripcionRubro: '' };

    this.miFormulario = this.fb.group({
      descripcionRubro: [this.rubro.descripcionRubro, Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.accion === 'actualizar' && this.rubro) {
      this.miFormulario.patchValue({
        descripcionRubro: this.rubro.descripcionRubro,
      });
    }
  }

  guardar(): void {
    if (this.miFormulario.invalid) {
      this.snackBar.open('La descripción es obligatoria.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const rubroData = this.miFormulario.value;

    if (this.accion === 'crear') {
      this.http.post('http://localhost:8080/rubros', rubroData).subscribe({
        next: () => {
          this.snackBar.open('Rubro creado correctamente.', 'Cerrar', {
            duration: 3000,
          });
          this.datosActualizadosRubro.emit();
          this.dialogRef.close();
        },
        error: () => {
          this.snackBar.open('Error al crear el rubro.', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    } else {
      this.http
        .put(`http://localhost:8080/rubros/${this.rubro.idRubro}`, rubroData)
        .subscribe({
          next: () => {
            this.snackBar.open('Rubro actualizado correctamente.', 'Cerrar', {
              duration: 3000,
            });
            this.datosActualizadosRubro.emit();
            this.dialogRef.close();
          },
          error: () => {
            this.snackBar.open('Error al actualizar el rubro.', 'Cerrar', {
              duration: 3000,
            });
          },
        });
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
