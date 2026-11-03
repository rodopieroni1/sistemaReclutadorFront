import { HttpInterceptorFn } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

interface JwtPayload {
  exp: number;
}

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const usuarioToken = sessionStorage.getItem('usuarioToken');
  const tokenPostulante = sessionStorage.getItem('token');

  let token: string | null = null;

  if (usuarioToken) {
    token = usuarioToken;
  } else if (tokenPostulante) {
    token = tokenPostulante;
  }

  if (!token) {
    return next(req);
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      if (usuarioToken) {
        sessionStorage.removeItem('usuarioToken');
        router.navigate(['/login'], {
          queryParams: { expired: 'true' },
          replaceUrl: true,
        });
      } else {
        sessionStorage.removeItem('token');
        router.navigate(['/login-user'], {
          queryParams: { expired: 'true' },
          replaceUrl: true,
        });
      }

      return next(req);
    }

    const reqConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(reqConToken);

  } catch (error) {
    console.error('JWT inválido:', error);

    if (usuarioToken) {
      sessionStorage.removeItem('usuarioToken');
      router.navigate(['/login'], { replaceUrl: true });
    } else {
      sessionStorage.removeItem('token');
      router.navigate(['/login-user'], { replaceUrl: true });
    }

    return next(req);
  }
};
