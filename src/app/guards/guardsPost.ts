import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CanActivateFn, Router } from '@angular/router';

interface JwtPayload {
  exp: number;
}

export const PostulanteGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');

  if (!token) {
    router.navigate(['/login-user']);
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      sessionStorage.clear();
      router.navigate(['/login-user']);
      return false;
    }
    return true;
  } catch {
    sessionStorage.clear();
    router.navigate(['/login-user']);
    return false;
  }
};
