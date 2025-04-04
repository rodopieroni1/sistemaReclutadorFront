import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ListadoOfertasService } from '../../listado-ofertas.service';

@Component({
  selector: 'app-cuerpo',
  standalone: true,
  imports: [CommonModule, MatCardModule], // Importa Material Card y módulos necesarios
  templateUrl: './cuerpo.component.html',
  styleUrl: './cuerpo.component.css',
})
export class CuerpoComponent implements OnInit {
  ofertas: any[] = [];

  constructor(private ofertaService: ListadoOfertasService) {}

  ngOnInit(): void {
    this.ofertaService.getOfertas().subscribe((data) => {
      this.ofertas = data;
    });
  }
}
