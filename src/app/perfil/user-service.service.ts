import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { catchError, Observable, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  [x: string]: any;
  constructor(private http: HttpClient) {}

  getUsers(id: number): Observable<User> {
    // 👈 VALIDACIÓN CRÍTICA: Extraemos la URL y verificamos que exista y no sea nula/id
    const baseUrl = environment?.local?.urlApi;
    if (!baseUrl || !id) {
      console.warn(
        'UserService: urlApi o ID no válidos. Evitando petición corrupta.',
        { baseUrl, id },
      );
      return throwError(
        () => new Error('Configuración de API o ID inválidos.'),
      );
    }

    return this.http
      .get<User>(`${baseUrl}perfiles/${id}`) // Usamos template strings para evitar errores de concatenación
      .pipe(catchError(this.handleError));
  }

  updateUsuario(id: number, formData: FormData): Observable<any> {
    const baseUrl = environment?.local?.urlApi;
    if (!baseUrl || !id) {
      return throwError(
        () => new Error('Configuración de API o ID inválidos.'),
      );
    }
    console.log('ID del baseUrl:', baseUrl);
    return this.http
      .put(`${baseUrl}/perfiles/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  validarUsuario(usuario: any, foto: File | null, cv: File | null): string[] {
    const errores: string[] = [];
    if (!usuario.dni?.trim()) {
      errores.push('Debe ingresar el DNI.');
    } else if (usuario.dni.length < 7 || usuario.dni.length > 8) {
      errores.push('El DNI debe tener entre 7 y 8 dígitos.');
    }
    if (!usuario.nombre?.trim()) {
      errores.push('Debe ingresar el nombre.');
    } else if (usuario.nombre.length > 50) {
      errores.push('El nombre no puede superar los 50 caracteres.');
    }
    if (!usuario.direccion?.trim()) {
      errores.push('Debe ingresar la dirección.');
    } else if (usuario.direccion.length > 100) {
      errores.push('La dirección no puede superar los 100 caracteres.');
    }
    if (!usuario.email?.trim()) {
      errores.push('Debe ingresar el email.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usuario.email)) {
        errores.push('El email no tiene un formato válido.');
      }
    }
    if (!usuario.clave?.trim()) {
      errores.push('Debe ingresar la clave.');
    } else if (usuario.clave.length > 30) {
      errores.push('La clave no puede superar los 30 caracteres.');
    }
    if (foto && foto.size > 5 * 1024 * 1024) {
      errores.push('La foto supera los 5 MB.');
    }
    if (cv && cv.size > 5 * 1024 * 1024) {
      errores.push('El CV supera los 5 MB.');
    }
    return errores;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ocurrio un ERROR de red o URL inválida:', error.error);
    } else {
      console.error(
        'Backend Retorno codigo de Error',
        error.status,
        error.message,
      );
    }
    return throwError(
      () => new Error('Algo Fallo por favor intente nuevamente'),
    );
  }
}
