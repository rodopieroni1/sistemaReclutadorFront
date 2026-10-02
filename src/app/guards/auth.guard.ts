import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('usuarioToken');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      sessionStorage.removeItem('usuarioToken');
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (error) {
    sessionStorage.removeItem('usuarioToken');
    router.navigate(['/login']);
    return false;
  }
};
