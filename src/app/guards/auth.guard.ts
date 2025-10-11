// auth-admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

export const AuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(Auth);

  const user = await new Promise((resolve) => {
    onAuthStateChanged(auth, resolve);
  });

  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
