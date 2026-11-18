import { CommonModule } from '@angular/common';
import { UbicacionService } from '../ubicacion.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ubicacion-prueba',
  imports: [CommonModule],
  templateUrl: './ubicacion-prueba.component.html',
  styleUrl: './ubicacion-prueba.component.css',
})
export class UbicacionPruebaComponent implements OnInit {
  paises: any[] = [];
  provincias: any[] = [];
  paisSeleccionado: string = '';

  constructor(private ubicacionService: UbicacionService) {}

  ngOnInit(): void {
    this.ubicacionService.getPaises().subscribe({
      next: (respuesta) => {
        console.log('Respuesta de países:', respuesta);
        this.paises = respuesta.data;
      },
      error: (error) => {
        console.error('Error al cargar países:', error);
      },
    });
  }

  cargarProvincias(pais: string): void {
    this.paisSeleccionado = pais;
    this.provincias = [];

    this.ubicacionService.getProvincias(pais).subscribe({
      next: (respuesta) => {
        console.log('Respuesta de provincias:', respuesta);

        if (!respuesta.error) {
          this.provincias = respuesta.data.states;
        }
      },
      error: (error) => {
        console.error('Error al cargar provincias:', error);
      },
    });
  }
}
