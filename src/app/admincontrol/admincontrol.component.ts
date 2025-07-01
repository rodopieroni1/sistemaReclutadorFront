import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ModalNuevaOfertaComponent } from './modal-nueva-oferta/modal-nueva-oferta.component';
import { ModalNuevaEmpresaComponent } from './modal-nueva-empresa/modal-nueva-empresa.component';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-admincontrol',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './admincontrol.component.html',
  styleUrls: ['./admincontrol.component.css'],
})
export class AdminControlComponent {
  [x: string]: any;
  aplicaciones: {
    [x: string]: any;
    id_aplicacion: number;
    fechaAplicacion: Date;
    oferta: {
      id: number;
      descripcionOferta: string;
      empresa: { nombre: string };
    };
    perfil: {
      id: number;
      nombre: string;
      email: string;
      documentoUrl: string;
      fotoUrl: string;
    };
    estadoAplicaciones: boolean;
    documentoUrl: string | null;
  }[] = [];
  empresas: {
    nombre: string;
    direccion: string;
    historiaEmpresa: string;
    observaciones: string;
    email: string;
    cuit: number;
    id_empresa: number;
  }[] = [];
  ofertas: {
    empresa: any;
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    estadoOferta: boolean;
  }[] = [];

  currentPage: number = 1; // Página actual
  itemsPerPage: number = 50; // Número de elementos por página
  //Aplicaciones
  id_aplicacion: number = 0;
  fechaAplicacion: Date = new Date();
  id_perfil: number = 1;
  estadoAplicaciones: boolean = true;
  //Empresa
  nombreEmpresa: string = '';
  direccionEmpresa: string = '';
  historiaEmpresa: string = '';
  observaciones: string = '';
  emailEmpresa: string = '';
  cuitEmpresa: number = 1;
  id_empresa: number = 1;
  //Oferta
  idOferta: number = 1;
  nombreOferta: string = '';
  descripcion: string = '';
  fotoOferta: string = '';

  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    this.http
      .get<
        {
          idaplicacion: number;
          fecha: Date;
          oferta: {
            id: number;
            nombreOferta: string;
            descripcionOferta: string;
            empresa: { nombre: string };
          };
          perfil: {
            id: number;
            nombre: string;
            email: string;
            documentoUrl: string;
            fotoUrl: string;
          };
          documentoUrl: string | null;
          estadoAplicaciones: boolean;
        }[]
      >('http://localhost:8080/aplicaciones')
      .subscribe((data) => {
        // Mapeamos las claves recibidas para que coincidan con las claves esperadas
        this.aplicaciones = data.map((aplicacion) => ({
          id_aplicacion: aplicacion.idaplicacion,
          fechaAplicacion: aplicacion.fecha,
          oferta: aplicacion.oferta, // Mantiene el objeto completo
          perfil: aplicacion.perfil, // Mantiene el objeto completo
          documentoUrl: aplicacion.perfil.documentoUrl
            ? aplicacion.perfil.documentoUrl.replace(/\\/g, '/')
            : null,
          estadoAplicaciones: aplicacion.estadoAplicaciones,
        }));
      });
    this.http
      .get<
        {
          nombre: string;
          id_empresa: number;
          cuit: number;
          email: string;
          direccion: string;
          historiaEmpresa: string;
          observaciones: string;
        }[]
      >('http://localhost:8080/empresas')
      .subscribe((data) => {
        this.empresas = data;
      });
    this.http
      .get<
        {
          idOferta: number;
          nombreOferta: string;
          descripcionOferta: string;
          fotoOferta: string;
          empresa: { nombre: string };
          estadoOferta: boolean;
        }[]
      >('http://localhost:8080/ofertas/todas')
      .subscribe((data) => {
        this.ofertas = data;
      });
  }

  NuevaOferta() {
    const dialogRef = this.dialog.open(ModalNuevaOfertaComponent, {
      width: '700px',
      data: { accion: 'crear' }, // Pasando la acción al modal
    });
    // Verifica que la instancia tenga acceso al evento y suscríbete
    dialogRef.componentInstance.datosActualizadosOferta.subscribe(() => {
      this.cargarOfertas(); // Recargar las ofertas
    });
  }
  cargarOfertas() {
    this.http
      .get<
        {
          idOferta: number;
          nombreOferta: string;
          descripcion: string;
          fotoOferta: string;
          empresa: { nombre: string };
          estadoOferta: boolean;
        }[]
      >('http://localhost:8080/ofertas/todas')
      .subscribe({
        next: (data) => {
          this.ofertas = data.map((oferta) => ({
            idOferta: oferta.idOferta,
            nombreOferta: oferta.nombreOferta,
            descripcionOferta: oferta.descripcion,
            fotoOferta: oferta.fotoOferta,
            empresa: oferta.empresa,
            estadoOferta: oferta.estadoOferta,
          }));
        },
        error: (error) => {
          console.error('Error al cargar las ofertas:', error);
        },
      });
  }

  NuevaEmpresa() {
    const dialogRef = this.dialog.open(ModalNuevaEmpresaComponent, {
      width: '700px',
      data: { accion: 'crear' }, // Pasando la acción al modal
    });
    // Verifica que la instancia tenga acceso al evento y suscríbete
    dialogRef.componentInstance.datosActualizadosEmpresa.subscribe(() => {
      this.cargarEmpresas(); // Recargar las ofertas
    });
  }

  cargarEmpresas() {
    this.http
      .get<
        {
          nombre: string;
          id_empresa: number;
          cuit: number;
          email: string;
          direccion: string;
          historiaEmpresa: string;
          observaciones: string;
        }[]
      >('http://localhost:8080/empresas')
      .subscribe({
        next: (data) => {
          this.empresas = data.map((empresa) => ({
            nombre: empresa.nombre,
            direccion: empresa.direccion,
            historiaEmpresa: empresa.historiaEmpresa,
            observaciones: empresa.observaciones,
            email: empresa.email,
            cuit: empresa.cuit,
            id_empresa: empresa.id_empresa,
          }));
        },
        error: (error) => {
          console.error('Error al cargar las empresas:', error);
        },
      });
  }

  updateEmpresa(empresa: {
    id_empresa: number;
    cuit: number;
    nombre: string;
    email: string;
    direccion: string;
    historiaEmpresa: string;
    observaciones: string;
  }) {
    const dialogRef = this.dialog.open(ModalNuevaEmpresaComponent, {
      width: '700px',
      data: { accion: 'actualizar', empresa: empresa }, // Pasando la acción y datos de la empresa
    });
    dialogRef.componentInstance.datosActualizadosEmpresa.subscribe(() => {
      this.cargarEmpresas(); // Recargar las empresas
      //dialogRef.componentInstance.cargarUpdate(this['empresa']);
    });
  }

  deleteEmpresa(empresa: { nombre: string; id_empresa: number }) {
    if (
      confirm(`¿Estás seguro que deseas eliminar la empresa ${empresa.nombre}?`)
    ) {
      this.http
        .delete(`http://localhost:8080/empresas/eliminar/${empresa.id_empresa}`)
        .subscribe({
          next: () => {
            alert('Empresa eliminada exitosamente');
            this.cargarEmpresas(); // Recargar las empresas
          },
          error: (error) => {
            alert('Ocurrió un error al intentar eliminar la empresa');
          },
        });
    }
  }

  updateOferta(oferta: {
    idOferta: number;
    nombreOferta: string;
    descripcionOferta: string;
    fotoOferta: string;
    estadoOferta: boolean;
    empresa: { nombre: string };
  }) {
    const dialogRef = this.dialog.open(ModalNuevaOfertaComponent, {
      width: '700px',
      data: { accion: 'actualizar', oferta: oferta }, // Pasando la acción y datos de la empresa
    });
    console.log('Ejecutando cargarOfertas');

    dialogRef.componentInstance.datosActualizadosOferta.subscribe(() => {
      this.cargarOfertas(); // Recargar las Ofertas
    });
  }

  deleteOferta(oferta: { idOferta: number; descripcionOferta: string }) {
    if (
      confirm(
        `¿Estás seguro que deseas eliminar la oferta ${oferta.descripcionOferta}?`
      )
    ) {
      this.http
        .delete(`http://localhost:8080/ofertas/eliminar/${oferta.idOferta}`)
        .subscribe({
          next: () => {
            alert('Oferta eliminada exitosamente');
            this.cargarOfertas(); // Recargar las empresas
          },
          error: (error) => {
            alert('Ocurrió un error al intentar eliminar la Oferta');
          },
        });
    }
  }

  /////////////////////////Paginacion///////////////////////////////////////
  getPaginatedDataOfertas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertas.slice(startIndex, endIndex);
  }
  empresasPaginadas: any[] = [];
  getPaginatedDataEmpresas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.empresas.slice(startIndex, endIndex);
  }

  getPaginatedDataAplicaciones() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedData = this.aplicaciones.slice(startIndex, endIndex);
    return paginatedData;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }
  getTotalPages() {
    return Math.ceil(this.ofertas.length / this.itemsPerPage);
  }
}
