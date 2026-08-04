import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArchivoServiceService {
  private apiUrl = environment.local.urlApi + '/archivos';

  constructor(private http: HttpClient) {}

  subirArchivo(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/subir`, formData);
  }

  obtenerArchivos() {
    return this.http.get<any[]>(this.apiUrl);
  }

  descargarArchivo(id: number) {
    return this.http.get(`${this.apiUrl}/descargar/${id}`, {
      responseType: 'blob',
    });
  }
}
