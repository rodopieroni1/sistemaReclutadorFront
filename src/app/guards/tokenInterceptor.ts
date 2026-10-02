import { HttpInterceptorFn } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';

interface JwtPayload {
  exp: number;
}

export const TokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const usuarioToken = sessionStorage.getItem('usuarioToken');
  if (usuarioToken) {
    try {
      const decoded = jwtDecode<JwtPayload>(usuarioToken);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        console.log('⏰ JWT administrativo expirado');
        sessionStorage.removeItem('usuarioToken');
        router.navigate(['/login'], {
          queryParams: { expired: 'true' },
          replaceUrl: true,
        });
        return EMPTY;
      }
    } catch (error) {
      console.error('❌ JWT administrativo inválido');
      sessionStorage.removeItem('usuarioToken');
      router.navigate(['/login'], {
        replaceUrl: true,
      });
      return EMPTY;
    }
  }

  const token = sessionStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        console.log('⏰ JWT postulante expirado');
        sessionStorage.removeItem('token');
        router.navigate(['/login-user'], {
          queryParams: { expired: 'true' },
          replaceUrl: true,
        });
        return EMPTY;
      }
    } catch (error) {
      console.error('❌ JWT postulante inválido');
      sessionStorage.removeItem('token');
      router.navigate(['/login-user'], {
        replaceUrl: true,
      });
      return EMPTY;
    }
  }
  return next(req);
};
