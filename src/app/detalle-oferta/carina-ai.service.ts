import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompatibilidadDTO {
  porcentajeCompatibilidad: number;
  experiencia: number | null;
  habilidades: number | null;
  formacion: number | null;
  ubicacion: number | null;
  modalidad: number | null;
  preferencias: number | null;
  fortalezas: string[];
  aspectosAMejorar: string[];
  requisitosCumplidos: string[];
  requisitosNoAcreditados: string[];
  requisitosObligatoriosCumplidos: string[];
  requisitosObligatoriosNoAcreditados: string[];
  requisitosDeseablesEncontrados: string[];
  requisitosDeseablesNoEncontrados: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CarinaAIService {

  private apiUrl = environment.local.urlApi;

  constructor(private http: HttpClient) {}

  analizarMiCompatibilidad(idOferta: number): Observable<CompatibilidadDTO> {
    const token = sessionStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<CompatibilidadDTO>(
      `${this.apiUrl}/carina-ai/ofertas/${idOferta}/mi-compatibilidad`,
      {},
      { headers }
    );
  }
}