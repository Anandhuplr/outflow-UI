import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  console.log('🔥🔥🔥 GUARD STARTED 🔥🔥🔥');

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔥 AuthService injected');

  return authService.getMe().pipe(
    
    map(user => {
      console.log('✅ USER RECEIVED:', user);
      return true;
    }),

    catchError(error => {
      console.error('❌ GET ME FAILED:', error);

      return of(
        router.createUrlTree(['/login'])
      );
    })

  );
};