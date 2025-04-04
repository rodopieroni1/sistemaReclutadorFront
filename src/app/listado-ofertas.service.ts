import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ListadoOfertasService {
  private apiUrl = 'http://localhost:8080/ofertas'; // URL de tu API REST
  constructor(private http: HttpClient) {}

  getOfertas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
