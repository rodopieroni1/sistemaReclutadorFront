import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private urlAnterior: string = '/home';
  private urlActual: string = '';

  constructor(private router: Router) {
    this.urlActual = this.router.url;

    // Escucha los cambios de ruta para almacenar la procedencia
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.urlAnterior = this.urlActual;
        this.urlActual = event.urlAfterRedirects;
      });
  }

  getPreviousUrl(): string {
    // Si la ruta previa es el propio detalle, evitamos un bucle infinito devolviendo /home
    if (this.urlAnterior.includes('detalle-oferta')) {
      return '/home';
    }
    return this.urlAnterior;
  }
}
