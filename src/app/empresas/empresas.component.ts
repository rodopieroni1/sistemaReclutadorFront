import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { CabeceraComponent } from '../home/cabecera/cabecera.component';
import { PiedepaginaComponent } from '../home/piedepagina/piedepagina.component';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    CabeceraComponent,
    PiedepaginaComponent,
  ],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css'],
})
export class EmpresasComponent implements OnInit {
  empresas: any[] = [];
  empresasFiltradas: any[] = [];
  buscarEmpresa = new FormControl('');
  urlApi = environment.local.urlApi;
  busquedaRealizada: boolean = false;
  resultados: any[] = [];
  ofertaEmpresa = new FormControl('');
  criterio = 'empresa';
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarEmpresas();
    this.buscarEmpresa.valueChanges.subscribe((valor) => {
      this.filtrarEmpresas(valor ?? '');
    });
  }

  cargarEmpresas(): void {
    this.http.get<any[]>(`${this.urlApi}/empresas`).subscribe({
      next: (data) => {
        console.log('Empresas cargadas:', data);
        this.empresas = data;
        this.empresasFiltradas = data;
      },
      error: (error) => {
        console.error('Error al cargar empresas', error);
      },
    });
  }

  filtrarEmpresas(texto: string): void {
    texto = texto.toLowerCase().trim();
    this.empresasFiltradas = this.empresas.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(texto) ||
        e.rubro?.descripcionRubro?.toLowerCase().includes(texto),
    );
  }

  verOfertas(idEmpresa: number): void {
    console.log('Empresa seleccionada:', idEmpresa);

    // Acá después podemos mostrar solamente las ofertas
    // de esa empresa.
  }
  searchJobs(event: Event) {
    event.preventDefault();
    const termino = this.ofertaEmpresa.value?.trim();
    if (!termino) {
      this.resultados = [];
      this.busquedaRealizada = false;
      return;
    }

    let params = new HttpParams();
    if (this.criterio === 'oferta') {
      params = params.set('nombreOferta', termino);
    } else if (this.criterio === 'empresa') {
      params = params.set('descripcionEmpresa', termino);
    } else if (this.criterio === 'rubro') {
      params = params.set('descripcionRubro', termino);
    }
    this.http.get(`${this.urlApi}/ofertas`, { params }).subscribe(
      (data: any) => {
        this.resultados = data;
        this.busquedaRealizada = true;
      },
      (error) => console.error('Error al buscar empleos:', error),
    );
  }
}
