import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environment';

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
  ],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css'],
})
export class EmpresasComponent implements OnInit {
  empresas: any[] = [];
  empresasFiltradas: any[] = [];
  buscarEmpresa = new FormControl('');
  urlApi = environment.local.urlApi;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEmpresas();

    this.buscarEmpresa.valueChanges.subscribe((valor) => {
      this.filtrarEmpresas(valor ?? '');
    });
  }

  cargarEmpresas(): void {
    this.http.get<any[]>(`${this.urlApi}/empresas`).subscribe({
      next: (data) => {
        this.empresas = data;
        this.empresasFiltradas = data;
      },
      error: (error) => {
        console.error('Error al cargar empresas', error);
      },
    });
    console.log('Empresas cargadas:', this.empresas);
  }

  filtrarEmpresas(texto: string): void {
    texto = texto.toLowerCase();

    this.empresasFiltradas = this.empresas.filter(
      (e) =>
        e.nombre.toLowerCase().includes(texto) ||
        e.rubro?.toLowerCase().includes(texto),
    );
  }

  verOfertas(idEmpresa: number): void {
    console.log('Empresa seleccionada:', idEmpresa);

    // Acá después podemos mostrar solamente las ofertas
    // de esa empresa.
  }
}
