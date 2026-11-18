import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'https://countriesnow.space/api/v0.1';

  constructor(private http: HttpClient) {}

  // Obtener países
  getPaises(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/countries/iso`);
  }

  // Obtener provincias de un país
  getProvincias(pais: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/countries/states/q?country=${encodeURIComponent(pais)}`,
    );
  }

  // Obtener localidades de una provincia
  getLocalidades(pais: string, provincia: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/countries/state/cities`, {
      country: pais,
      state: provincia,
    });
  }
}
