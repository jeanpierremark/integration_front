import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const requiredRole = route.data['role'];       

  if (!token) {
    router.navigate(['/connexion']);
    return false;
  }

  if (requiredRole && userRole !== requiredRole) {
    router.navigate(['/connexion']);
    return false;
  }

  return true;

};
