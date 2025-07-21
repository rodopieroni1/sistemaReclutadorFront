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
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        sessionStorage.clear();
        router.navigate(['/login-user'], {
          queryParams: { expired: 'true' },
          replaceUrl: true,
        });
        return EMPTY; // ❌ cancela la petición
      }
    } catch {
      sessionStorage.clear();
      router.navigate(['/login-user']);
    }
  }

  return next(req);
};
