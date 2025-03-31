import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalNuevaOfertaComponent } from './modal-nueva-oferta/modal-nueva-oferta.component';
import { ModalNuevaEmpresaComponent } from './modal-nueva-empresa/modal-nueva-empresa.component';

@Component({
  standalone: true,
  selector: 'app-admincontrol',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CabeceraComponent,
    MatDialogModule,
  ],
  templateUrl: './admincontrol.component.html',
  styleUrls: ['./admincontrol.component.css'],
})
export class AdminControlComponent {
  [x: string]: any;
  empresas: { nombre: string }[] = [];
  ofertas: { idOferta: number; nombre: string; descripcionOferta: string }[] =
    [];
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 50; // Número de elementos por página

  nombreEmpresa: string = '';
  direccionEmpresa: string = '';
  historiaEmpresa: string = '';
  observaciones: string = '';
  emailEmpresa: string = '';
  cuitEmpresa: number = 1;

  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.http
      .get<{ nombre: string }[]>('http://localhost:8080/empresas')
      .subscribe((data) => {
        this.empresas = data;
      });

    this.http
      .get<{ idOferta: number; nombre: string; descripcionOferta: string }[]>(
        'http://localhost:8080/ofertas/todas'
      )
      .subscribe((data) => {
        this.ofertas = data;
      });
  }

  getPaginatedDataOfertas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertas.slice(startIndex, endIndex);
  }

  getPaginatedDataEmpresas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.empresas.slice(startIndex, endIndex);
  }
  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getTotalPages() {
    return Math.ceil(this.ofertas.length / this.itemsPerPage);
  }

  NuevaEmpresa() {
    const dialogRef = this.dialog.open(ModalNuevaEmpresaComponent, {
      width: '700px',
      data: {
        nombreEmpresa: this.nombreEmpresa,
        direccionEmpresa: this.direccionEmpresa,
        historiaEmpresa: this.historiaEmpresa,
        observaciones: this.observaciones,
        email: this.emailEmpresa,
        cuit: this.cuitEmpresa,
      },
    });
  }
  NuevaOferta() {
    const dialogRef = this.dialog.open(ModalNuevaOfertaComponent, {
      width: '700px',
    });
  }
}
