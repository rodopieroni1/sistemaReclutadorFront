import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalNuevaOfertaComponent } from './modal-nueva-oferta/modal-nueva-oferta.component';
import { ModalNuevaEmpresaComponent } from './modal-nueva-empresa/modal-nueva-empresa.component';
import { environment } from '../../environments/environment';
import { Auth, signOut } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

interface Empresa {
  nombre: string;
  direccion: string;
  historiaEmpresa: string;
  observaciones: string;
  email: string;
  cuit: number;
  telefono: string;
  id_empresa: number;
  rubro: {
    idRubro: number;
    descripcionRubro: string;
  };
}

interface Rubros {
  idRubro: number;
  descripcionRubro: string;
}

interface Ofertas {
  idOferta: number;
  nombreOferta: string;
  descripcionOferta: string;
  fotoOferta: string;
  empresa: { nombre: string };
  estadoOferta: boolean;
}

interface Aplicaciones {
  id_aplicacion: number;
  fechaAplicacion: Date;
  oferta: {
    id: number;
    descripcionOferta: string;
    nombreOferta: string;
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
}

@Component({
  standalone: true,
  selector: 'app-admincontrol',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
      nombreOferta: string;
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
  }[] = [];
  rubros: {
    idRubro: number;
    descripcionRubro: string;
  }[] = [];
  empresas: {
    nombre: string;
    direccion: string;
    historiaEmpresa: string;
    observaciones: string;
    email: string;
    cuit: number;
    telefono: string;
    id_empresa: number;
    rubro: {
      idRubro: number;
      descripcionRubro: string;
    };
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
  buscarAplicaciones = new FormControl('');
  aplicacionesFiltradas: Aplicaciones[] = [];
  //Rubro
  buscarRubro = new FormControl('');
  rubrosFiltradas: Rubros[] = [];
  //Empresa
  nombreEmpresa: string = '';
  direccionEmpresa: string = '';
  historiaEmpresa: string = '';
  observaciones: string = '';
  emailEmpresa: string = '';
  telefonoEmpresa: string = '';
  cuitEmpresa: number = 1;
  id_empresa: number = 1;
  buscarEmpresa = new FormControl('');
  empresasFiltradas: Empresa[] = [];
  //Oferta
  idOferta: number = 1;
  nombreOferta: string = '';
  descripcion: string = '';
  fotoOferta: string = '';
  buscarOferta = new FormControl('');
  ofertasFiltradas: Ofertas[] = [];
  private router = inject(Router);
  private auth = inject(Auth);

  private apiUrl = environment.local.urlApi;
  constructor(
    private http: HttpClient, // public dialogRef: MatDialogRef<ModalNuevaEmpresaComponent>
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 1000000);
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
      >(`${this.apiUrl}/aplicaciones/activas`)
      .subscribe((data) => {
        this.aplicaciones = data.map((item) => ({
          ...item,
          id_aplicacion: item.idaplicacion,
          fechaAplicacion: item.fecha,
        }));
        this.aplicacionesFiltradas = [...this.aplicaciones];
      });
    this.cargarAplicaciones();
    this.buscarAplicaciones.valueChanges.subscribe((valor) => {
      this.filtrarAplicaciones(valor ?? '');
    });
    this.http
      .get<
        { idRubro: number; descripcionRubro: string }[]
      >(`${this.apiUrl}/rubro`)
      .subscribe((data) => {
        this.rubros = data;
        this.rubrosFiltradas = [...this.rubros];
      });
    this.cargarRubros();
    this.buscarRubro.valueChanges.subscribe((valor) => {
      this.filtrarRubros(valor ?? '');
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
          telefono: string;
          rubro: {
            idRubro: number;
            descripcionRubro: string;
          };
        }[]
      >(`${this.apiUrl}/empresas`)
      .subscribe((data) => {
        this.empresas = data;
        this.empresasFiltradas = [...this.empresas];
      });
    this.cargarEmpresas();
    this.buscarEmpresa.valueChanges.subscribe((valor) => {
      this.filtrarEmpresas(valor ?? '');
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
      >(`${this.apiUrl}/ofertas/disponibles`)
      .subscribe((data) => {
        this.ofertas = data;
        this.ofertasFiltradas = [...this.ofertas];
      });
    this.cargarOfertas();
    this.buscarOferta.valueChanges.subscribe((valor) => {
      this.filtrarOfertas(valor ?? '');
    });
  }

  nuevoRubro() {
    const descripcion = prompt('Ingrese la descripción del nuevo rubro:');
    if (descripcion) {
      this.http
        .post(`${this.apiUrl}/rubro/crear`, {
          descripcionRubro: descripcion,
        })
        .subscribe({
          next: (response: any) => {
            alert(response.message || 'Rubro creado exitosamente');
            this.cargarRubros();
          },
          error: (err) => {
            const mensajeError =
              err.error?.message || 'Error al crear el rubro';
            alert(mensajeError);
          },
        });
    }
  }

  cargarAplicaciones() {
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
      >(`${this.apiUrl}/aplicaciones`)
      .subscribe({
        next: (data) => {
          this.aplicaciones = data.map(
            (d) =>
              ({
                ...d,
                id_aplicacion: (d as any).idaplicacion,
                fechaAplicacion: (d as any).fecha,
              }) as any,
          );
        },
        error: (error) => {
          console.error('Error al cargar las aplicaciones:', error);
        },
      });
  }

  cargarRubros() {
    this.http
      .get<
        { idRubro: number; descripcionRubro: string }[]
      >(`${this.apiUrl}/rubro`)
      .subscribe({
        next: (data) => {
          this.rubros = data;
          this.rubrosFiltradas = [...this.rubros];
        },
        error: (error) => {
          console.error('Error al cargar los rubros:', error);
        },
      });
  }

  eliminarRubro(rubro: { idRubro: number; descripcionRubro: string }) {
    if (
      confirm(
        `¿Estás seguro que deseas eliminar el rubro "${rubro.descripcionRubro}"?`,
      )
    ) {
      this.http
        .delete(`${this.apiUrl}/rubro/eliminar/${rubro.idRubro}`, {
          responseType: 'text',
        })
        .subscribe({
          next: (mensaje) => {
            alert(mensaje);
            this.cargarRubros();
          },
          error: (error) => {
            alert(error.error);
          },
        });
    }
  }

  actualizarRubro(rubro: { idRubro: number; descripcionRubro: string }) {
    const nuevaDescripcion = prompt(
      'Editar descripción del rubro:',
      rubro.descripcionRubro,
    );
    if (nuevaDescripcion) {
      this.http
        .put(`${this.apiUrl}/rubro/actualizar/${rubro.idRubro}`, {
          descripcionRubro: nuevaDescripcion,
        })
        .subscribe({
          next: (response: any) => {
            alert(response.message || 'Rubro modificado exitosamente');
            this.cargarRubros();
          },
          error: (err) => {
            const mensajeError =
              err.error?.message || 'Error al modificar el rubro';
            alert(mensajeError);
          },
        });
    }
  }

  nuevaEmpresa() {
    const dialogRef = this.dialog.open(ModalNuevaEmpresaComponent, {
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { accion: 'crear' }, // Pasando la acción al modal
    });
    // Verifica que la instancia tenga acceso al evento y suscríbete
    dialogRef.componentInstance.datosActualizadosEmpresa.subscribe(() => {
      this.cargarEmpresas(); // Recargar las ofertas
    });
  }

  cargarEmpresas() {
    this.http.get<any>(`${this.apiUrl}/empresas`).subscribe({
      next: (response) => {
        // Extraemos la lista desde la propiedad 'data' del objeto que responde el backend
        const listaEmpresas = response.data || [];

        this.empresas = listaEmpresas.map((empresa: any) => ({
          nombre: empresa.nombre,
          direccion: empresa.direccion,
          historiaEmpresa: empresa.historiaEmpresa,
          observaciones: empresa.observaciones,
          email: empresa.email,
          cuit: empresa.cuit,
          telefono: empresa.telefono,
          id_empresa: empresa.id_empresa,
          rubro: empresa.rubro,
          logo: empresa.logo,
        }));

        this.empresasFiltradas = [...this.empresas];
      },
      error: (error) => {
        console.error('Error al cargar empresas', error);
      },
    });
  }

  filtrarAplicaciones(texto: string): void {
    texto = texto.toLowerCase().trim();

    this.aplicacionesFiltradas = this.aplicaciones.filter(
      (a) =>
        a.oferta?.nombreOferta?.toLowerCase().includes(texto) ||
        a.oferta?.empresa?.nombre?.toLowerCase().includes(texto) ||
        a.perfil?.nombre?.toLowerCase().includes(texto),
    );
  }

  filtrarEmpresas(texto: string): void {
    texto = texto.toLowerCase().trim();
    this.empresasFiltradas = this.empresas.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(texto) ||
        e.rubro?.descripcionRubro?.toLowerCase().includes(texto),
    );
  }

  filtrarRubros(texto: string): void {
    texto = texto.toLowerCase().trim();
    this.rubrosFiltradas = this.rubros.filter((r) =>
      r.descripcionRubro?.toLowerCase().includes(texto),
    );
  }

  filtrarOfertas(texto: string): void {
    texto = texto.toLowerCase().trim();
    this.ofertasFiltradas = this.ofertas.filter(
      (o) =>
        o.nombreOferta?.toLowerCase().includes(texto) ||
        o.empresa?.nombre?.toLowerCase().includes(texto),
    );
  }

  updateEmpresa(empresa: {
    id_empresa: number;
    cuit: number;
    nombre: string;
    email: string;
    direccion: string;
    historiaEmpresa: string;
    telefono: string;
    observaciones: string;
  }) {
    const dialogRef = this.dialog.open(ModalNuevaEmpresaComponent, {
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
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
        .delete(`${this.apiUrl}/empresas/eliminar/${empresa.id_empresa}`)
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

  nuevaOferta() {
    const dialogRef = this.dialog.open(ModalNuevaOfertaComponent, {
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { accion: 'crear' }, // Pasando la acción al modal
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarOfertas(); // Recargar las ofertas si se creó una nueva oferta
      }
    });
  }

  cargarOfertas() {
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
      >(`${this.apiUrl}/ofertas`)
      .subscribe({
        next: (data) => {
          this.ofertas = data.map((oferta) => ({
            idOferta: oferta.idOferta,
            nombreOferta: oferta.nombreOferta,
            descripcionOferta: oferta.descripcionOferta,
            fotoOferta: oferta.fotoOferta,
            empresa: oferta.empresa,
            estadoOferta: oferta.estadoOferta,
          }));
          this.ofertasFiltradas = [...this.ofertas];
        },
        error: (error) => {
          console.error('Error al cargar las ofertas:', error);
        },
      });
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
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { accion: 'actualizar', oferta: oferta }, // Pasando la acción y datos de la empresa
    });
    console.log('Ejecutando cargarOfertas');

    dialogRef.componentInstance['datosActualizadosOferta'].subscribe(() => {
      this.cargarOfertas(); // Recargar las Ofertas
    });
  }

  deleteOferta(oferta: { idOferta: number; descripcionOferta: string }) {
    if (
      confirm(
        `¿Estás seguro que deseas eliminar la oferta ${oferta.descripcionOferta}?`,
      )
    ) {
      this.http
        .delete(`${this.apiUrl}/ofertas/eliminar/${oferta.idOferta}`)
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

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }
  /////////////////////////Paginacion///////////////////////////////////////
  getPaginatedDataOfertas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.ofertasFiltradas.slice(startIndex, endIndex);
  }

  getPaginatedDataEmpresas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.empresasFiltradas.slice(startIndex, endIndex);
  }

  getPaginatedDataRubros() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.rubrosFiltradas.slice(startIndex, endIndex);
  }
  getPaginatedDataAplicaciones() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.aplicacionesFiltradas.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1) {
      this.currentPage = page;
    }
  }

  getTotalPages(totalItems: number) {
    return Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
  }
}
